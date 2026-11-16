import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupportedLocales, isCommentsEnabled } from '@/lib/env';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { estimateReadingTime, extractToc, rewriteMarkdownMediaUrls } from '@/lib/markdown';
import {
  getArticleBySlug,
  getGlobalConfig,
  getSiteBySlug,
  getSites,
} from '@/lib/strapi';
import { activeTheme } from '@/themes';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; siteSlug: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, siteSlug, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const [{ article }, site] = await Promise.all([
    getArticleBySlug(siteSlug, slug, locale),
    getSiteBySlug(siteSlug, locale),
  ]);

  if (!article) return {};

  const title = article.seo?.metaTitle || `${article.title}${site ? ` · ${site.name}` : ''}`;
  const description = article.seo?.metaDescription || article.summary || undefined;

  return {
    title,
    description,
    keywords: article.seo?.keywords || undefined,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; siteSlug: string; slug: string }>;
}) {
  const { locale: rawLocale, siteSlug, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const supportedLocales = getSupportedLocales();
  const dict = getDictionary(locale);

  const [global, allSites, site, articleResult] = await Promise.all([
    getGlobalConfig(locale),
    getSites(locale),
    getSiteBySlug(siteSlug, locale),
    getArticleBySlug(siteSlug, slug, locale),
  ]);

  if (!site || !articleResult.article) {
    notFound();
  }

  const { article, isFallbackLocale } = articleResult;
  const renderedContent = rewriteMarkdownMediaUrls(article.content || '');
  const toc = extractToc(renderedContent);
  const readingTime = article.readingTime || estimateReadingTime(renderedContent);

  const { ArticleDetailView } = activeTheme;

  return (
    <ArticleDetailView
      locale={locale}
      supportedLocales={supportedLocales}
      dict={dict}
      global={global}
      site={site}
      allSites={allSites}
      article={article}
      renderedContent={renderedContent}
      toc={toc}
      readingTime={readingTime}
      isFallbackLocale={isFallbackLocale}
      commentsEnabled={isCommentsEnabled()}
    />
  );
}
