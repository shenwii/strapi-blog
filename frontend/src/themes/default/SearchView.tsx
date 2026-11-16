import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { buildHref } from '@/lib/i18n';
import type { SearchViewProps } from '../types';
import { ArticleCard } from './components/ArticleCard';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

export function SearchView({
  locale,
  supportedLocales,
  dict,
  global,
  site,
  allSites,
  query,
  articles,
  pagination,
}: SearchViewProps) {
  const accent = site.accentColor || '#0ea5e9';
  const searchAction = buildHref(locale, `/${site.slug}/search`);

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
        currentPathWithoutLocale={`/${site.slug}/search`}
        portalTitle={global?.portalTitle || site.name}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href={buildHref(locale, `/${site.slug}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{site.name}</span>
        </Link>

        <form action={searchAction} method="GET" className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={dict.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[var(--site-accent,#0ea5e9)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {dict.searchButton}
          </button>
        </form>

        {query && (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            {dict.searchResultsFor}: <strong className="text-slate-900 dark:text-slate-100">{query}</strong> ({pagination.total})
          </p>
        )}

        {articles.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">{dict.noArticles}</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
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
      </main>

      <SiteFooter locale={locale} dict={dict} global={global} allSites={allSites} />
    </div>
  );
}
