import { notFound } from 'next/navigation';
import { getDefaultTheme, getSupportedLocales } from '@/lib/env';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import {
  getArticles,
  getGlobalConfig,
  getSiteBySlug,
  getSites,
  getTags,
} from '@/lib/strapi';
import { getTheme } from '@/themes';

export const dynamic = 'force-dynamic';

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; siteSlug: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: rawLocale, siteSlug, slug } = await params;
  const { page: rawPage } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const page = Math.max(1, Number.parseInt(rawPage || '1', 10) || 1);
  const supportedLocales = getSupportedLocales();
  const dict = getDictionary(locale);

  const [global, allSites, site, tags, articlesResult] = await Promise.all([
    getGlobalConfig(locale),
    getSites(locale),
    getSiteBySlug(siteSlug, locale),
    getTags(locale),
    getArticles({ siteSlug, locale, tagSlug: slug, page, pageSize: 12 }),
  ]);

  if (!site) {
    notFound();
  }

  const tag = tags.find((t) => t.slug === slug);
  const { TaxonomyView } = getTheme(site.theme || global?.defaultTheme || getDefaultTheme());

  return (
    <TaxonomyView
      locale={locale}
      supportedLocales={supportedLocales}
      dict={dict}
      global={global}
      site={site}
      allSites={allSites}
      kind="tag"
      taxonomyTitle={tag ? `#${tag.name}` : `#${slug}`}
      articles={articlesResult.articles}
      pagination={articlesResult.pagination}
    />
  );
}
