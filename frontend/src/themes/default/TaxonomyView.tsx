import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Folder, Tag as TagIcon } from 'lucide-react';
import { buildHref } from '@/lib/i18n';
import type { TaxonomyViewProps } from '../types';
import { ArticleCard } from './components/ArticleCard';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

export function TaxonomyView({
  locale,
  supportedLocales,
  dict,
  global,
  site,
  allSites,
  kind,
  taxonomyTitle,
  taxonomyDescription,
  articles,
  pagination,
}: TaxonomyViewProps) {
  const accent = site.accentColor || '#0ea5e9';

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
        <Link
          href={buildHref(locale, `/${site.slug}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{site.name}</span>
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-7 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--site-accent,#0ea5e9)]">
            {kind === 'category' ? <Folder className="h-3.5 w-3.5" /> : <TagIcon className="h-3.5 w-3.5" />}
            <span>{kind === 'category' ? dict.categories : dict.tags}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {taxonomyTitle}
          </h1>
          {taxonomyDescription && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{taxonomyDescription}</p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {pagination.total} {dict.postsCount}
          </p>
        </div>

        {articles.length === 0 ? (
          <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">{dict.noArticles}</p>
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
