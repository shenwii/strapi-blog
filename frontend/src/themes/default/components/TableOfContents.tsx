import React from 'react';
import { List } from 'lucide-react';
import type { TocItem } from '@/lib/markdown';

export function TableOfContents({ items, title }: { items: TocItem[]; title: string }) {
  if (items.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <List className="h-3.5 w-3.5" />
        <span>{title}</span>
      </div>
      <nav aria-label={title}>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? 'pl-3.5' : ''}>
              <a
                href={`#${item.id}`}
                className="block leading-snug text-slate-600 transition hover:text-[var(--site-accent,#0ea5e9)] dark:text-slate-400 dark:hover:text-[var(--site-accent,#0ea5e9)]"
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
