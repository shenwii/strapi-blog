import { notFound } from 'next/navigation';
import { getDefaultTheme, getSupportedLocales } from '@/lib/env';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import {
  getArticles,
  getCategoriesBySite,
  getGlobalConfig,
  getSiteBySlug,
  getSites,
} from '@/lib/strapi';
import { getTheme } from '@/themes';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({
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

  const [global, allSites, site, categories, articlesResult] = await Promise.all([
    getGlobalConfig(locale),
    getSites(locale),
    getSiteBySlug(siteSlug, locale),
    getCategoriesBySite(siteSlug, locale),
    getArticles({ siteSlug, locale, categorySlug: slug, page, pageSize: 12 }),
  ]);

  if (!site) {
    notFound();
  }

  const category = categories.find((c) => c.slug === slug);
  const { TaxonomyView } = getTheme(site.theme || global?.defaultTheme || getDefaultTheme());

  return (
    <TaxonomyView
      locale={locale}
      supportedLocales={supportedLocales}
      dict={dict}
      global={global}
      site={site}
      allSites={allSites}
      kind="category"
      taxonomyTitle={category?.name || slug}
      taxonomyDescription={category?.description}
      articles={articlesResult.articles}
      pagination={articlesResult.pagination}
    />
  );
}
