import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { buildHref, formatDate, type Dictionary } from '@/lib/i18n';
import { estimateReadingTime } from '@/lib/markdown';
import { resolveMediaUrl, type Article } from '@/lib/strapi';
import type { ThemeSkin } from '../skins';

export function ThemedArticleCard({
  skin,
  article,
  siteSlug,
  locale,
  dict,
  featuredLayout = false,
}: {
  skin: ThemeSkin;
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
      className={`group flex flex-col overflow-hidden transition ${skin.cardClass} ${
        featuredLayout ? 'md:grid md:grid-cols-12 md:items-stretch' : ''
      }`}
    >
      {coverUrl && (
        <Link
          href={href}
          className={`relative block overflow-hidden bg-slate-200/50 dark:bg-slate-800/50 ${
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

      <div
        className={`flex flex-1 flex-col justify-between p-6 ${
          featuredLayout && coverUrl ? 'md:col-span-7' : featuredLayout ? 'md:col-span-12' : ''
        }`}
      >
        <div>
          {featuredLayout && skin.variant === 'cyber' && (
            <div className="mb-3 flex items-center gap-1.5 font-mono text-[11px] text-cyan-500/80">
              <span className="h-2 w-2 rounded-full bg-rose-500/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              <span className="ml-2">~/featured/{article.slug}.md</span>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            {article.featured && (
              <span className="rounded-full bg-[var(--site-accent,#0ea5e9)]/15 px-2.5 py-0.5 font-semibold text-[var(--site-accent,#0ea5e9)]">
                {dict.featured}
              </span>
            )}
            {article.category && (
              <Link
                href={buildHref(locale, `/${siteSlug}/categories/${article.category.slug}`)}
                className={`px-2.5 py-0.5 font-medium transition ${skin.chipClass}`}
              >
                {article.category.name}
              </Link>
            )}
            {article.site && (
              <span className={skin.variant === 'cyber' ? 'font-mono text-cyan-500/80' : 'opacity-50'}>
                /{article.site.slug}
              </span>
            )}
          </div>

          <Link href={href}>
            <h3
              className={`font-bold transition group-hover:text-[var(--site-accent,#0ea5e9)] ${
                skin.headingClass
              } ${featuredLayout ? 'text-2xl sm:text-3xl' : 'text-xl'}`}
            >
              {article.title}
            </h3>
          </Link>

          {article.summary && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed opacity-75">
              {article.summary}
            </p>
          )}
        </div>

        <div
          className={`mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-4 text-xs opacity-70 dark:border-slate-800/70 ${
            skin.variant === 'cyber' ? 'font-mono' : ''
          }`}
        >
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
            className="inline-flex items-center gap-1 font-semibold transition group-hover:text-[var(--site-accent,#0ea5e9)]"
          >
            <span>{dict.readMore}</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
