import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { buildHref, formatDate, type Dictionary } from '@/lib/i18n';
import { estimateReadingTime } from '@/lib/markdown';
import { resolveMediaUrl, type Article } from '@/lib/strapi';

export function ArticleCard({
  article,
  siteSlug,
  locale,
  dict,
  featuredLayout = false,
}: {
  article: Article;
  siteSlug: string;
  locale: string;
  dict: Dictionary;
  featuredLayout?: boolean;
}) {
  const href = buildHref(locale, `/${siteSlug}/posts/${article.slug}`);
  const coverUrl = resolveMediaUrl(article.cover?.url);
  const date = formatDate(article.publishedDate || article.publishedAt || article.createdAt, locale);
  const readingMinutes = article.readingTime || estimateReadingTime(article.content || '');

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800/90 dark:bg-slate-900/70 dark:hover:border-slate-700 ${
        featuredLayout ? 'md:grid md:grid-cols-12 md:items-stretch' : ''
      }`}
    >
      {coverUrl && (
        <Link
          href={href}
          className={`relative block overflow-hidden bg-slate-100 dark:bg-slate-800 ${
            featuredLayout ? 'aspect-[16/10] md:col-span-5 md:aspect-auto' : 'aspect-[16/9]'
          }`}
        >
          <img
            src={coverUrl}
            alt={article.cover?.alternativeText || article.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
      )}

      <div className={`flex flex-1 flex-col justify-between p-6 ${featuredLayout && coverUrl ? 'md:col-span-7' : featuredLayout ? 'md:col-span-12' : ''}`}>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            {article.featured && (
              <span className="rounded-full bg-[var(--site-accent,#0ea5e9)]/15 px-2.5 py-0.5 font-medium text-[var(--site-accent,#0ea5e9)]">
                {dict.featured}
              </span>
            )}
            {article.category && (
              <Link
                href={buildHref(locale, `/${siteSlug}/categories/${article.category.slug}`)}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {article.category.name}
              </Link>
            )}
            {article.site && (
              <span className="text-slate-400 dark:text-slate-500">/{article.site.slug}</span>
            )}
          </div>

          <Link href={href}>
            <h3
              className={`font-bold tracking-tight text-slate-900 transition group-hover:text-[var(--site-accent,#0ea5e9)] dark:text-slate-100 ${
                featuredLayout ? 'text-2xl sm:text-3xl' : 'text-xl'
              }`}
            >
              {article.title}
            </h3>
          </Link>

          {article.summary && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {article.summary}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex items-center gap-4">
            {date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readingMinutes} {dict.minRead}
            </span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1 font-medium text-slate-900 transition group-hover:text-[var(--site-accent,#0ea5e9)] dark:text-slate-200"
          >
            <span>{dict.readMore}</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
