import { Handlers } from "$fresh/server.ts";
import { getPosts } from "@/utils/posts.ts";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toLastmod(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const handler: Handlers = {
  async GET(req, _ctx) {
    const posts = await getPosts();
    const origin = new URL(req.url).origin;

    const entries: SitemapEntry[] = [
      { loc: `${origin}/` },
      { loc: `${origin}/gallery` },
      ...posts.map((post) => ({
        loc: `${origin}/${post.slug}`,
        lastmod: toLastmod(post.attrs.publishedAt),
      })),
    ];

    const body = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...entries.flatMap((entry) => {
        const lines = [
          `  <url>`,
          `    <loc>${escapeXml(entry.loc)}</loc>`,
        ];
        if (entry.lastmod) {
          lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
        }
        lines.push(`  </url>`);
        return lines;
      }),
      `</urlset>`,
      ``,
    ].join("\n");

    return new Response(body, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
      },
    });
  },
};
