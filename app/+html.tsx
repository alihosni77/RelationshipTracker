import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0712" />
        <meta name="color-scheme" content="dark" />
        <meta name="description" content="همقدم؛ فضای خصوصی و مشترک برای دو نفر، برای پیام، خاطره، رویداد و ارتباط روزمره." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <ScrollViewStyleReset />
      </head>
      <body style={{ margin: 0, backgroundColor: '#0A0712' }}>{children}</body>
    </html>
  );
}
