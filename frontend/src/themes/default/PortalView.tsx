import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Layers, Sparkles } from 'lucide-react';
import { buildHref } from '@/lib/i18n';
import { resolveMediaUrl } from '@/lib/strapi';
import type { PortalViewProps } from '../types';
import { ArticleCard } from './components/ArticleCard';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

export function PortalView({
  locale,
  supportedLocales,
  dict,
  global,
  sites,
  recentArticles,
}: PortalViewProps) {
  const portalTitle = global?.portalTitle || 'Strapi Multi-Site Blog';

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        locale={locale}
        supportedLocales={supportedLocales}
        dict={dict}
        allSites={sites}
        currentPathWithoutLocale="/"
        portalTitle={portalTitle}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-sky-50/60 p-8 sm:p-12 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-sky-950/20">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span>Multi-Site CMS Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
              {portalTitle}
            </h1>
            {global?.portalSubtitle && (
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
                {global.portalSubtitle}
              </p>
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-500" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {dict.allSites}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sites.map((site) => {
              const accent = site.accentColor || '#0ea5e9';
              const coverUrl = resolveMediaUrl(site.cover?.url);
              return (
                <Link
                  key={site.documentId}
                  href={buildHref(locale, `/${site.slug}`)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
                >
                  {coverUrl && (
                    <div className="mb-5 aspect-[16/8] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <img
                        src={coverUrl}
                        alt={site.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: `${accent}18`,
                          color: accent,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        {site.badge || `/${site.slug}`}
                      </span>
                      <span className="font-mono text-xs text-slate-400">/{site.slug}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 transition group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400">
                      {site.name}
                    </h3>
                    {site.tagline && (
                      <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {site.tagline}
                      </p>
                    )}
                    {site.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {site.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <span>{dict.enterSite}</span>
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {recentArticles.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {dict.allPosts}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article) => (
                <ArticleCard
                  key={`${article.documentId}-${article.locale || locale}`}
                  article={article}
                  siteSlug={article.site?.slug || sites[0]?.slug || 'home-assistant'}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter locale={locale} dict={dict} global={global} allSites={sites} />
    </div>
  );
}
