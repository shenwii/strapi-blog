import React from 'react';
import Link from 'next/link';
import { Globe, Rss, Search, Sparkles, Terminal } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { buildHref, getLocaleLabel, type Dictionary } from '@/lib/i18n';
import type { Site } from '@/lib/strapi';
import type { ThemeSkin } from '../skins';

export function ThemedHeader({
  skin,
  locale,
  supportedLocales,
  dict,
  currentSite,
  allSites,
  currentPathWithoutLocale,
  portalTitle,
}: {
  skin: ThemeSkin;
  locale: string;
  supportedLocales: string[];
  dict: Dictionary;
  currentSite?: Site | null;
  allSites: Site[];
  currentPathWithoutLocale: string;
  portalTitle: string;
}) {
  const accent = currentSite?.accentColor || skin.defaultAccent;

  return (
    <header
      className={`sticky top-0 z-40 ${skin.headerClass}`}
      style={{ '--site-accent': accent } as React.CSSProperties}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={currentSite ? buildHref(locale, `/${currentSite.slug}`) : buildHref(locale, '/')}
            className="flex items-center gap-2.5 truncate"
          >
            {skin.variant === 'cyber' ? (
              <Terminal className="h-4 w-4 shrink-0 text-cyan-500" />
            ) : skin.variant === 'anime' ? (
              <Sparkles className="h-4 w-4 shrink-0 text-pink-500" />
            ) : (
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
            )}
            <span
              className={`truncate text-lg font-bold ${skin.headingClass} ${
                skin.titleGradientClass || ''
              }`}
            >
              {currentSite ? currentSite.name : portalTitle}
            </span>
          </Link>

          {allSites.length > 1 && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Sites">
              <Link
                href={buildHref(locale, '/')}
                className={`px-2.5 py-1.5 text-xs font-medium transition ${
                  !currentSite
                    ? skin.chipActiveClass
                    : 'rounded-lg text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'
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
                    className={`px-2.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? skin.chipActiveClass
                        : 'rounded-lg text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'
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
                className={`inline-flex h-9 w-9 items-center justify-center transition ${skin.secondaryButtonClass}`}
              >
                <Search className="h-4 w-4" />
              </Link>
              <a
                href={buildHref(locale, `/${currentSite.slug}/rss.xml`)}
                aria-label={dict.rssFeed}
                title={dict.rssFeed}
                className={`inline-flex h-9 w-9 items-center justify-center transition ${skin.secondaryButtonClass}`}
              >
                <Rss className="h-4 w-4" />
              </a>
            </>
          )}

          {supportedLocales.length > 1 && (
            <div className={`inline-flex items-center p-0.5 ${skin.secondaryButtonClass}`}>
              <Globe className="ml-2 mr-1 hidden h-3.5 w-3.5 opacity-60 sm:inline" />
              {supportedLocales.map((loc) => {
                const active = loc === locale;
                return (
                  <Link
                    key={loc}
                    href={buildHref(loc, currentPathWithoutLocale)}
                    className={`px-2 py-1 text-xs font-medium transition ${
                      active ? skin.chipActiveClass : 'opacity-75 hover:opacity-100'
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
        <div className={skin.subNavBorderClass}>
          <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-4 py-2 text-xs sm:px-6">
            {currentSite.navLinks.map((link, idx) =>
              link.isExternal ? (
                <a
                  key={`${link.href}-${idx}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-medium opacity-75 transition hover:opacity-100"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={`${link.href}-${idx}`}
                  href={buildHref(locale, link.href)}
                  className="shrink-0 font-medium opacity-75 transition hover:opacity-100"
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
