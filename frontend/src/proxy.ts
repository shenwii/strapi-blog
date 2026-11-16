import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDefaultLocale, getSupportedLocales } from './lib/env';

const IGNORED_PREFIXES = [
  '/_next',
  '/bff',
  '/api',
  '/admin',
  '/uploads',
  '/mcp',
  '/favicon.ico',
  '/robots.txt',
];

const STATIC_ASSET_EXT = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|woff2?|ttf|eot|txt|map)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    STATIC_ASSET_EXT.test(pathname)
  ) {
    return NextResponse.next();
  }

  const supportedLocales = getSupportedLocales();
  const defaultLocale = getDefaultLocale();

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // If URL already starts with a supported locale (e.g. /en/home-assistant or /zh-Hans/life), let Next.js route directly
  if (firstSegment && supportedLocales.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Friendly alias: /zh/... -> /zh-Hans/... when zh-Hans is supported
  if (firstSegment === 'zh' && supportedLocales.includes('zh-Hans')) {
    const rest = segments.slice(1).join('/');
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/zh-Hans/${rest}` : '/zh-Hans';
    return NextResponse.redirect(url);
  }

  // Rewrite paths without locale prefix (e.g. /, /home-assistant, /life) to default locale internally
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
