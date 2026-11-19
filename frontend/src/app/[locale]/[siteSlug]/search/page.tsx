import { notFound } from 'next/navigation';
import { getDefaultTheme, getSupportedLocales } from '@/lib/env';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { getArticles, getGlobalConfig, getSiteBySlug, getSites } from '@/lib/strapi';
import { getTheme } from '@/themes';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; siteSlug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale: rawLocale, siteSlug } = await params;
  const { q = '', page: rawPage } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const page = Math.max(1, Number.parseInt(rawPage || '1', 10) || 1);
  const query = q.trim();
  const supportedLocales = getSupportedLocales();
  const dict = getDictionary(locale);

  const [global, allSites, site, articlesResult] = await Promise.all([
    getGlobalConfig(locale),
    getSites(locale),
    getSiteBySlug(siteSlug, locale),
    query
      ? getArticles({ siteSlug, locale, search: query, page, pageSize: 12 })
      : Promise.resolve({
          articles: [],
          pagination: { page: 1, pageSize: 12, pageCount: 1, total: 0 },
        }),
  ]);

  if (!site) {
    notFound();
  }

  const { SearchView } = getTheme(site.theme || global?.defaultTheme || getDefaultTheme());

  return (
    <SearchView
      locale={locale}
      supportedLocales={supportedLocales}
      dict={dict}
      global={global}
      site={site}
      allSites={allSites}
      query={query}
      articles={articlesResult.articles}
      pagination={articlesResult.pagination}
    />
  );
}
