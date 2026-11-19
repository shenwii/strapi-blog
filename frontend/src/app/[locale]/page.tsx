import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDefaultSiteSlug, getDefaultTheme, getPortalName, getSupportedLocales } from '@/lib/env';
import { buildHref, getDictionary, normalizeLocale } from '@/lib/i18n';
import { getArticles, getGlobalConfig, getSites } from '@/lib/strapi';
import { getTheme } from '@/themes';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const global = await getGlobalConfig(locale);

  return {
    title: global?.seo?.metaTitle || global?.portalTitle || getPortalName(),
    description: global?.seo?.metaDescription || global?.portalSubtitle || undefined,
  };
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const supportedLocales = getSupportedLocales();
  const dict = getDictionary(locale);

  const [global, sites, recent] = await Promise.all([
    getGlobalConfig(locale),
    getSites(locale),
    getArticles({ locale, page: 1, pageSize: 6 }),
  ]);

  const defaultSiteSlug = getDefaultSiteSlug() || global?.defaultSiteSlug || '';
  if (defaultSiteSlug && sites.some((s) => s.slug === defaultSiteSlug)) {
    redirect(buildHref(locale, `/${defaultSiteSlug}`));
  }

  const { PortalView } = getTheme(global?.defaultTheme || getDefaultTheme());

  return (
    <PortalView
      locale={locale}
      supportedLocales={supportedLocales}
      dict={dict}
      global={global}
      sites={sites}
      recentArticles={recent.articles}
    />
  );
}
