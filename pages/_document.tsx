import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192x192.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="description" content="PlanPro - Smart Project Management System" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
