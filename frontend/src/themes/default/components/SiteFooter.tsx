import React from 'react';
import Link from 'next/link';
import { buildHref, type Dictionary } from '@/lib/i18n';
import type { GlobalConfig, Site } from '@/lib/strapi';

export function SiteFooter({
  locale,
  dict,
  global,
  allSites,
}: {
  locale: string;
  dict: Dictionary;
  global: GlobalConfig | null;
  allSites: Site[];
}) {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-slate-50/70 py-10 dark:border-slate-800/80 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {global?.portalTitle || 'Strapi Multi-Site Blog'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {global?.footerText || 'Powered by Strapi v5 & Next.js'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <Link href={buildHref(locale, '/')} className="hover:text-slate-900 dark:hover:text-white">
            {dict.allSites}
          </Link>
          {allSites.map((site) => (
            <Link
              key={site.documentId}
              href={buildHref(locale, `/${site.slug}`)}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              {site.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
