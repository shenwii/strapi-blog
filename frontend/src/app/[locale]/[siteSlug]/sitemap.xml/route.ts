import { NextRequest, NextResponse } from 'next/server';
import { getPublicSiteUrl } from '@/lib/env';
import { buildHref, normalizeLocale } from '@/lib/i18n';
import { getArticles, getSiteBySlug } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ locale: string; siteSlug: string }> }
) {
  const { locale: rawLocale, siteSlug } = await context.params;
  const locale = normalizeLocale(rawLocale);
  const baseUrl = getPublicSiteUrl();

  const [site, { articles }] = await Promise.all([
    getSiteBySlug(siteSlug, locale),
    getArticles({ siteSlug, locale, page: 1, pageSize: 100 }),
  ]);

  if (!site) {
    return new NextResponse('Site not found', { status: 404 });
  }

  const urls = [
    `<url><loc>${baseUrl}${buildHref(locale, `/${site.slug}`)}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...articles.map((article) => {
      const loc = `${baseUrl}${buildHref(locale, `/${site.slug}/posts/${article.slug}`)}`;
      const lastmod = (article.updatedAt || article.publishedAt || article.publishedDate || '').slice(0, 10);
      return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }),
  ].join('\n  ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
