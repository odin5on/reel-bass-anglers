import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html class="h-full">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reel Bass Anglers</title>
        <link rel="stylesheet" href="/styles.css" />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="Reel Bass Anglers"
          href="/feed.xml"
        />
      </head>
      <body class="flex flex-col h-full">
        <Component />
      </body>
    </html>
  );
}
