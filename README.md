# Reel Bass Anglers

Static site for [reelbassanglers.com](https://reelbassanglers.com). The app is a
[Deno Fresh](https://fresh.deno.dev/) project. GitHub Pages serves the
prerendered files in `_site/`.

## Develop

Install [Deno](https://docs.deno.com/runtime/getting_started/installation/),
then start the dev server:

```sh
deno task start
```

The server watches `routes/` and `static/` and restarts when they change.

## Build the static site

GitHub Pages cannot run the Fresh server, so pages are rendered to HTML at build
time.

```sh
deno task pages
```

That task:

1. Runs `deno task build`, which writes compiled Tailwind CSS and any island
   JavaScript into `_fresh/`.
2. Requests every route through the Fresh handler and writes `_site/`.

The output includes:

- `index.html`, `gallery/index.html`, and one directory per post
- `feed.xml` (Atom)
- `404.html`
- files from `static/`, including images and the compiled `styles.css`
- `CNAME` containing `reelbassanglers.com`, so the site is served from the
  domain root

Preview it locally:

```sh
deno run -A jsr:@std/http/file-server _site
```

`deno task preview` still starts the Fresh server instead of the static files.
Use that when you want the server runtime. Use `deno task pages` for the site
GitHub Pages publishes.

## Deployment

`.github/workflows/deploy.yml` publishes `_site/` with the official GitHub Pages
actions (`configure-pages`, `upload-pages-artifact`, and `deploy-pages`).

- A push to `main`, or a manual run (`workflow_dispatch`), builds and deploys.
- A pull request builds and uploads the artifact, and does not deploy.

The repository has to be public before GitHub Pages will serve the site.

After this workflow is on `main`, set **Settings → Pages → Build and deployment
→ Source** to **GitHub Actions**. The `CNAME` file in the artifact sets the
custom domain to `reelbassanglers.com`.

## Feed

The Atom feed is [`/feed.xml`](https://reelbassanglers.com/feed.xml). It used to
be `/feed`. GitHub Pages chooses the content type from the file extension, and
an extensionless `/feed` file would not be served as XML.

## Email subscription

The header subscribe form posted to `/` and called Resend. GitHub Pages cannot
run that handler, so the form, the `POST` handler, and the thanks page are
removed. A form service or newsletter tool can be wired up later without
bringing back a server.
