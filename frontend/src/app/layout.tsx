import type { Metadata } from 'next';
import React from 'react';
import { getDefaultLocale, getPortalName } from '@/lib/env';
import './globals.css';

export const metadata: Metadata = {
  title: getPortalName(),
  description: 'Multi-site Markdown blog powered by Strapi v5 and Next.js',
};

const themeInitScript = `
(function() {
  try {
    var mode = localStorage.getItem('theme-mode');
    if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultLocale = getDefaultLocale();

  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
