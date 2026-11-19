import React from 'react';
import Link from 'next/link';
import { buildHref, type Dictionary } from '@/lib/i18n';
import type { GlobalConfig, Site } from '@/lib/strapi';
import type { ThemeSkin } from '../skins';

export function ThemedFooter({
  skin,
  locale,
  dict,
  global,
  allSites,
}: {
  skin: ThemeSkin;
  locale: string;
  dict: Dictionary;
  global: GlobalConfig | null;
  allSites: Site[];
}) {
  return (
    <footer className={`mt-20 py-10 ${skin.footerClass}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className={`text-sm font-semibold ${skin.headingClass}`}>
            {global?.portalTitle || 'Strapi Multi-Site Blog'}
          </p>
          <p className="mt-1 text-xs opacity-65">
            {global?.footerText || 'Powered by Strapi v5 & Next.js'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs opacity-75">
          <Link href={buildHref(locale, '/')} className="hover:opacity-100">
            {dict.allSites}
          </Link>
          {allSites.map((site) => (
            <Link
              key={site.documentId}
              href={buildHref(locale, `/${site.slug}`)}
              className="hover:opacity-100"
            >
              {site.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
