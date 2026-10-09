/**
 * Render the Fresh app to a static site in `_site/` for GitHub Pages.
 *
 * Run `deno task build` first so Tailwind and island bundles exist in `_fresh/`.
 * `deno task pages` does both steps.
 */
import { createHandler } from "$fresh/server.ts";
import { dirname, fromFileUrl, join, relative } from "@std/path";
import manifest from "../fresh.gen.ts";
import config from "../fresh.config.ts";
import { getPosts } from "../utils/posts.ts";

const root = join(dirname(fromFileUrl(import.meta.url)), "..");
const outDir = join(root, "_site");
const SITE_ORIGIN = Deno.env.get("SITE_ORIGIN") ??
  "https://reelbassanglers.com";

const TEXT_TYPE = /html|css|javascript|ecmascript|xml|json|svg|text\//;

Deno.chdir(root);

const snapshotPath = join(root, "_fresh", "snapshot.json");
try {
  await Deno.stat(snapshotPath);
} catch {
  console.error(
    "Missing _fresh/snapshot.json. Run `deno task build` before prerendering.",
  );
  Deno.exit(1);
}

await Deno.remove(outDir, { recursive: true }).catch(() => {});
await Deno.mkdir(outDir, { recursive: true });

const handler = await createHandler(manifest, config);

const pending: string[] = [];
const seen = new Set<string>();

function enqueue(raw: string) {
  const pathname = normalizePath(raw);
  if (pathname === null || seen.has(pathname)) return;
  seen.add(pathname);
  pending.push(pathname);
}

function normalizePath(raw: string): string | null {
  const withoutHash = raw.split("#")[0] ?? "";
  let pathname = withoutHash.split("?")[0] ?? "";
  if (pathname.startsWith(SITE_ORIGIN)) {
    pathname = new URL(pathname).pathname;
  }
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;
  if (pathname.includes("..")) return null;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}

function outputRel(pathname: string, contentType: string): string {
  if (pathname === "/") return "index.html";
  const rel = pathname.slice(1);
  const last = rel.split("/").pop() ?? "";
  if (last.includes(".")) return rel;
  if (contentType.includes("html")) return `${rel}/index.html`;
  return rel;
}

async function writeBytes(rel: string, bytes: Uint8Array) {
  const path = join(outDir, rel);
  await Deno.mkdir(dirname(path), { recursive: true });
  await Deno.writeFile(path, bytes);
}

function extractLinks(text: string): string[] {
  const found: string[] = [];
  const attr = /\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi;
  const cssUrl = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  const fresh = /\/_frsh\/[A-Za-z0-9._~/-]+/g;
  const jsImport = /(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g;
  for (const match of text.matchAll(attr)) {
    if (match[1]) found.push(match[1]);
  }
  for (const match of text.matchAll(cssUrl)) {
    if (match[1]) found.push(match[1]);
  }
  for (const match of text.matchAll(fresh)) found.push(match[0]);
  for (const match of text.matchAll(jsImport)) {
    if (match[1]) found.push(match[1]);
  }
  return found;
}

function resolveLink(raw: string, fromRel: string): string | null {
  if (raw.startsWith("/") || raw.startsWith(SITE_ORIGIN)) return raw;
  if (raw.startsWith("./") || raw.startsWith("../")) {
    const base = new URL(fromRel, "https://assets.local/");
    return new URL(raw, base).pathname;
  }
  return null;
}

async function save(
  pathname: string,
  response: Response,
  overrideRel?: string,
) {
  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";
  const rel = overrideRel ?? outputRel(pathname, contentType);
  await writeBytes(rel, bytes);
  console.log(`  ${pathname} -> ${rel} (${bytes.byteLength} bytes)`);

  if (
    TEXT_TYPE.test(contentType) || /\.(html|css|js|xml|svg|json)$/.test(rel)
  ) {
    const text = new TextDecoder().decode(bytes);
    for (const link of extractLinks(text)) {
      const resolved = resolveLink(link, rel);
      if (resolved) enqueue(resolved);
    }
  }
}

async function* walkFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = join(dir, entry.name);
    if (entry.isDirectory) {
      yield* walkFiles(path);
    } else if (entry.isFile) {
      yield path;
    }
  }
}

async function enqueueStaticDir(dir: string) {
  try {
    await Deno.stat(dir);
  } catch {
    return;
  }
  for await (const file of walkFiles(dir)) {
    const rel = relative(dir, file).replaceAll("\\", "/");
    enqueue("/" + rel);
  }
}

const posts = await getPosts();
for (
  const pathname of [
    "/",
    "/gallery",
    "/feed.xml",
    ...posts.map((post) => `/${post.slug}`),
  ]
) {
  enqueue(pathname);
}

await enqueueStaticDir(join(root, "static"));
await enqueueStaticDir(join(root, "_fresh", "static"));

const snapshot = JSON.parse(await Deno.readTextFile(snapshotPath)) as {
  build_id: string;
  files: Record<string, string[]>;
};
for (const file of Object.keys(snapshot.files)) {
  // Fresh serves bundled client JS at /_frsh/js/<build id>/<file>.
  // Copy every bundle so island imports keep working even when a chunk
  // is only referenced from another script.
  if (file.endsWith(".js")) {
    enqueue(`/_frsh/js/${snapshot.build_id}/${file}`);
  }
}

console.log(`Prerendering ${SITE_ORIGIN} into ${outDir}`);

while (pending.length > 0) {
  const pathname = pending.shift();
  if (pathname === undefined) break;

  const response = await handler(
    new Request(new URL(pathname, SITE_ORIGIN)),
  );

  if (
    response.status === 301 || response.status === 302 ||
    response.status === 307 || response.status === 308
  ) {
    const location = response.headers.get("location");
    if (location) enqueue(new URL(location, SITE_ORIGIN).pathname);
    await response.body?.cancel();
    continue;
  }

  if (response.status !== 200) {
    console.error(`${pathname} returned ${response.status}`);
    Deno.exit(1);
  }

  await save(pathname, response);
}

const notFound = await handler(
  new Request(new URL("/this-page-does-not-exist", SITE_ORIGIN)),
);
if (notFound.status !== 404) {
  console.error(`Expected 404 page, got ${notFound.status}`);
  Deno.exit(1);
}
await save("/404", notFound, "404.html");

await Deno.writeTextFile(join(outDir, "CNAME"), "reelbassanglers.com\n");
await Deno.writeTextFile(join(outDir, ".nojekyll"), "");

const required = [
  "index.html",
  "gallery/index.html",
  "feed.xml",
  "404.html",
  "CNAME",
  ".nojekyll",
  "styles.css",
  "favicon.ico",
  "logo.svg",
  ...posts.map((post) => `${post.slug}/index.html`),
];

for (const rel of required) {
  try {
    await Deno.stat(join(outDir, rel));
  } catch {
    console.error(`Missing ${rel} in ${outDir}`);
    Deno.exit(1);
  }
}

const css = await Deno.readTextFile(join(outDir, "styles.css"));
if (css.includes("@tailwind") || !css.includes("text-5xl")) {
  console.error("styles.css is not the compiled Tailwind stylesheet");
  Deno.exit(1);
}

const home = await Deno.readTextFile(join(outDir, "index.html"));
if (home.includes('name="email"') || home.includes("Subscribe")) {
  console.error("Homepage still renders the subscribe form");
  Deno.exit(1);
}

const feed = await Deno.readTextFile(join(outDir, "feed.xml"));
if (!feed.includes("<feed") || !feed.includes("/feed.xml")) {
  console.error("feed.xml is not an Atom feed");
  Deno.exit(1);
}
for (const post of posts) {
  if (!feed.includes(`/${post.slug}`)) {
    console.error(`feed.xml is missing /${post.slug}`);
    Deno.exit(1);
  }
}

const notFoundHtml = await Deno.readTextFile(join(outDir, "404.html"));
if (!notFoundHtml.includes("Page not found")) {
  console.error("404.html is missing the not-found page");
  Deno.exit(1);
}

console.log(
  `Wrote ${required.length} required files plus static assets for ${posts.length} posts.`,
);
