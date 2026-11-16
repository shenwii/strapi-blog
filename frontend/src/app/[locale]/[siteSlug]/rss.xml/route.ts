import { NextRequest, NextResponse } from 'next/server';
import { getPublicSiteUrl } from '@/lib/env';
import { buildHref, normalizeLocale } from '@/lib/i18n';
import { getArticles, getSiteBySlug } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ locale: string; siteSlug: string }> }
) {
  const { locale: rawLocale, siteSlug } = await context.params;
  const locale = normalizeLocale(rawLocale);
  const baseUrl = getPublicSiteUrl();

  const [site, { articles }] = await Promise.all([
    getSiteBySlug(siteSlug, locale),
    getArticles({ siteSlug, locale, page: 1, pageSize: 30 }),
  ]);

  if (!site) {
    return new NextResponse('Site not found', { status: 404 });
  }

  const siteUrl = `${baseUrl}${buildHref(locale, `/${site.slug}`)}`;
  const itemsXml = articles
    .map((article) => {
      const link = `${baseUrl}${buildHref(locale, `/${site.slug}/posts/${article.slug}`)}`;
      const pubDate = new Date(
        article.publishedDate || article.publishedAt || article.createdAt || Date.now()
      ).toUTCString();

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.summary || '')}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(site.description || site.tagline || '')}</description>
    <language>${escapeXml(locale)}</language>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
