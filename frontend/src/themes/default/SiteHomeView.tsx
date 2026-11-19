import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, Folder } from 'lucide-react';
import { buildHref } from '@/lib/i18n';
import { resolveMediaUrl } from '@/lib/strapi';
import type { SiteHomeViewProps } from '../types';
import { ArticleCard } from './components/ArticleCard';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

export function SiteHomeView({
  locale,
  supportedLocales,
  dict,
  global,
  site,
  allSites,
  categories,
  articles,
  pagination,
}: SiteHomeViewProps) {
  const accent = site.accentColor || '#0ea5e9';
  const coverUrl = resolveMediaUrl(site.cover?.url);
  const hasFeatured = pagination.page === 1 && articles.length > 0 && Boolean(articles[0].featured);
  const featuredArticle = hasFeatured ? articles[0] : null;
  const listArticles = hasFeatured ? articles.slice(1) : articles;

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ '--site-accent': accent } as React.CSSProperties}
    >
      <SiteHeader
        locale={locale}
        supportedLocales={supportedLocales}
        dict={dict}
        currentSite={site}
        allSites={allSites}
        currentPathWithoutLocale={`/${site.slug}`}
        portalTitle={global?.portalTitle || site.name}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {/* Site Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                  {site.badge || `/${site.slug}`}
                </span>
                <span className="text-xs text-slate-400">
                  {pagination.total} {dict.postsCount}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
                {site.name}
              </h1>
              {site.tagline && (
                <p className="mt-3 text-base font-medium text-slate-700 dark:text-slate-300">
                  {site.tagline}
                </p>
              )}
              {site.description && (
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {site.description}
                </p>
              )}
            </div>

            {coverUrl && (
              <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:w-64 dark:bg-slate-800">
                <img src={coverUrl} alt={site.name} className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <Folder className="h-3.5 w-3.5" />
                {dict.categories}:
              </span>
              <Link
                href={buildHref(locale, `/${site.slug}`)}
                className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
              >
                {dict.allPosts}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.documentId}
                  href={buildHref(locale, `/${site.slug}/categories/${cat.slug}`)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Articles */}
        {articles.length === 0 ? (
          <section className="mt-12 rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dict.noArticles}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {dict.noArticlesDesc}
            </p>
          </section>
        ) : (
          <div className="mt-10 space-y-8">
            {featuredArticle && (
              <ArticleCard
                article={featuredArticle}
                siteSlug={site.slug}
                locale={locale}
                dict={dict}
                featuredLayout
              />
            )}

            {listArticles.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listArticles.map((article) => (
                  <ArticleCard
                    key={article.documentId}
                    article={article}
                    siteSlug={site.slug}
                    locale={locale}
                    dict={dict}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            {pagination.page > 1 && (
              <Link
                href={buildHref(locale, `/${site.slug}?page=${pagination.page - 1}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
                {dict.pagePrev}
              </Link>
            )}
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {pagination.page} / {pagination.pageCount}
            </span>
            {pagination.page < pagination.pageCount && (
              <Link
                href={buildHref(locale, `/${site.slug}?page=${pagination.page + 1}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {dict.pageNext}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </main>

      <SiteFooter locale={locale} dict={dict} global={global} allSites={allSites} />
    </div>
  );
}
