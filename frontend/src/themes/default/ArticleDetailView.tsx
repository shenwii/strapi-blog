import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Info, Tag as TagIcon, User } from 'lucide-react';
import { CommentSection } from '@/components/CommentSection';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { buildHref, formatDate } from '@/lib/i18n';
import { resolveMediaUrl } from '@/lib/strapi';
import type { ArticleDetailViewProps } from '../types';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { TableOfContents } from './components/TableOfContents';

export function ArticleDetailView({
  locale,
  supportedLocales,
  dict,
  global,
  site,
  allSites,
  article,
  renderedContent,
  toc,
  readingTime,
  isFallbackLocale,
  commentsEnabled,
}: ArticleDetailViewProps) {
  const accent = site.accentColor || '#0ea5e9';
  const coverUrl = resolveMediaUrl(article.cover?.url);
  const date = formatDate(article.publishedDate || article.publishedAt || article.createdAt, locale);

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
        currentPathWithoutLocale={`/${site.slug}/posts/${article.slug}`}
        portalTitle={global?.portalTitle || site.name}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Link
            href={buildHref(locale, `/${site.slug}`)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              {dict.backToBlog} · {site.name}
            </span>
          </Link>
        </div>

        {isFallbackLocale && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <Info className="h-4 w-4 shrink-0" />
            <span>{dict.fallbackNotice}</span>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-12">
          <article className="min-w-0 lg:col-span-8">
            <header className="mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                {article.category && (
                  <Link
                    href={buildHref(locale, `/${site.slug}/categories/${article.category.slug}`)}
                    className="rounded-full px-3 py-1 font-semibold"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                  >
                    {article.category.name}
                  </Link>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
                {article.title}
              </h1>

              {article.summary && (
                <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {article.summary}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-5 border-y border-slate-200/80 py-3.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {article.authorName && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <User className="h-3.5 w-3.5" />
                    {article.authorName}
                  </span>
                )}
                {date && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {date}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime} {dict.minRead}
                </span>
              </div>
            </header>

            {coverUrl && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                <img
                  src={coverUrl}
                  alt={article.cover?.alternativeText || article.title}
                  className="max-h-[460px] w-full object-cover"
                />
              </div>
            )}

            <MarkdownRenderer content={renderedContent} />

            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-6 dark:border-slate-800">
                <TagIcon className="h-4 w-4 text-slate-400" />
                {article.tags.map((tag) => (
                  <Link
                    key={tag.documentId}
                    href={buildHref(locale, `/${site.slug}/tags/${tag.slug}`)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {commentsEnabled && article.allowComments !== false && (
              <CommentSection
                articleDocumentId={article.documentId}
                locale={locale}
                dict={dict}
              />
            )}
          </article>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-6">
              <TableOfContents items={toc} title={dict.toc} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} dict={dict} global={global} allSites={allSites} />
    </div>
  );
}
