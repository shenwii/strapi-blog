import React from 'react';
import { List } from 'lucide-react';
import type { TocItem } from '@/lib/markdown';
import type { ThemeSkin } from '../skins';

export function ThemedToc({
  skin,
  items,
  title,
}: {
  skin: ThemeSkin;
  items: TocItem[];
  title: string;
}) {
  if (items.length === 0) return null;

  return (
    <aside className={`p-5 ${skin.panelClass}`}>
      <div
        className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-65 ${
          skin.variant === 'cyber' ? 'font-mono' : ''
        }`}
      >
        <List className="h-3.5 w-3.5" />
        <span>{title}</span>
      </div>
      <nav aria-label={title}>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? 'pl-3.5' : ''}>
              <a
                href={`#${item.id}`}
                className="block leading-snug opacity-75 transition hover:text-[var(--site-accent,#0ea5e9)] hover:opacity-100"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
