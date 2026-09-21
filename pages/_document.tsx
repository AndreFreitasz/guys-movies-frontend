import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="icon" type="image/png" href="/icons/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/favicon.png" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <meta name="color-scheme" content="dark" />
      </Head>
      <body className="bg-defaultBackground antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
