import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupportedLocales } from '@/lib/env';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import {
  getArticles,
  getCategoriesBySite,
  getGlobalConfig,
  getSiteBySlug,
  getSites,
} from '@/lib/strapi';
import { activeTheme } from '@/themes';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; siteSlug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, siteSlug } = await params;
  const locale = normalizeLocale(rawLocale);
  const site = await getSiteBySlug(siteSlug, locale);
  if (!site) return {};

  return {
    title: site.seo?.metaTitle || site.name,
    description: site.seo?.metaDescription || site.tagline || site.description || undefined,
  };
}

export default async function SiteHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; siteSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: rawLocale, siteSlug } = await params;
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
    getArticles({ siteSlug, locale, page, pageSize: 10 }),
  ]);

  if (!site) {
    notFound();
  }

  const { SiteHomeView } = activeTheme;

  return (
    <SiteHomeView
      locale={locale}
      supportedLocales={supportedLocales}
      dict={dict}
      global={global}
      site={site}
      allSites={allSites}
      categories={categories}
      articles={articlesResult.articles}
      pagination={articlesResult.pagination}
    />
  );
}
