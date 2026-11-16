import React from 'react';
import { notFound } from 'next/navigation';
import { getSupportedLocales } from '@/lib/env';
import { normalizeLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const supported = getSupportedLocales();
  const locale = normalizeLocale(rawLocale);

  if (!supported.includes(locale) && rawLocale !== locale) {
    notFound();
  }

  return <>{children}</>;
}
