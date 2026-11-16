import React from 'react';
import Link from 'next/link';
import { Globe, Rss, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { buildHref, getLocaleLabel, type Dictionary } from '@/lib/i18n';
import type { Site } from '@/lib/strapi';

export function SiteHeader({
  locale,
  supportedLocales,
  dict,
  currentSite,
  allSites,
  currentPathWithoutLocale,
  portalTitle,
}: {
  locale: string;
  supportedLocales: string[];
  dict: Dictionary;
  currentSite?: Site | null;
  allSites: Site[];
  currentPathWithoutLocale: string;
  portalTitle: string;
}) {
  const accent = currentSite?.accentColor || '#0ea5e9';

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85"
      style={{ '--site-accent': accent } as React.CSSProperties}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={currentSite ? buildHref(locale, `/${currentSite.slug}`) : buildHref(locale, '/')}
            className="flex items-center gap-2.5 truncate"
          >
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {currentSite ? currentSite.name : portalTitle}
            </span>
          </Link>

          {allSites.length > 1 && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Sites">
              <Link
                href={buildHref(locale, '/')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  !currentSite
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                }`}
              >
                {dict.allSites}
              </Link>
              {allSites.map((s) => {
                const active = currentSite?.slug === s.slug;
                return (
                  <Link
                    key={s.documentId}
                    href={buildHref(locale, `/${s.slug}`)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                    }`}
                  >
                    {s.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentSite && (
            <>
              <Link
                href={buildHref(locale, `/${currentSite.slug}/search`)}
                aria-label={dict.searchButton}
                title={dict.searchButton}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
              >
                <Search className="h-4 w-4" />
              </Link>
              <a
                href={buildHref(locale, `/${currentSite.slug}/rss.xml`)}
                aria-label={dict.rssFeed}
                title={dict.rssFeed}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
              >
                <Rss className="h-4 w-4" />
              </a>
            </>
          )}

          {supportedLocales.length > 1 && (
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <Globe className="ml-2 mr-1 hidden h-3.5 w-3.5 text-slate-400 sm:inline" />
              {supportedLocales.map((loc) => {
                const active = loc === locale;
                return (
                  <Link
                    key={loc}
                    href={buildHref(loc, currentPathWithoutLocale)}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {getLocaleLabel(loc)}
                  </Link>
                );
              })}
            </div>
          )}

          <ThemeToggle label={dict.switchTheme} />
        </div>
      </div>

      {currentSite?.navLinks && currentSite.navLinks.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-900">
          <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-4 py-2 text-xs sm:px-6">
            {currentSite.navLinks.map((link, idx) =>
              link.isExternal ? (
                <a
                  key={`${link.href}-${idx}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={`${link.href}-${idx}`}
                  href={buildHref(locale, link.href)}
                  className="shrink-0 font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
