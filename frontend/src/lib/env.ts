export function getStrapiInternalUrl(): string {
  return (process.env.STRAPI_INTERNAL_URL || 'http://backend:1337').replace(/\/+$/, '');
}

export function getStrapiPublicUrl(): string {
  return (process.env.STRAPI_PUBLIC_URL || '').replace(/\/+$/, '');
}

export function getPublicSiteUrl(): string {
  return (process.env.PUBLIC_SITE_URL || 'http://localhost:8080').replace(/\/+$/, '');
}

export function getStrapiApiToken(): string {
  return process.env.STRAPI_API_TOKEN || '';
}

export function getSupportedLocales(): string[] {
  const raw = process.env.SUPPORTED_LOCALES || 'zh-Hans,en';
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : ['zh-Hans', 'en'];
}

export function getDefaultLocale(): string {
  const supported = getSupportedLocales();
  const configured = (process.env.DEFAULT_LOCALE || 'zh-Hans').trim();
  return supported.includes(configured) ? configured : supported[0];
}

export function getDefaultSiteSlug(): string {
  return (process.env.DEFAULT_SITE_SLUG || '').trim();
}

export function getDefaultTheme(): string {
  return (process.env.DEFAULT_THEME || 'default').trim();
}

export function getPortalName(): string {
  return process.env.NEXT_PUBLIC_PORTAL_NAME || 'Strapi Multi-Site Blog';
}

export function isCommentsEnabled(): boolean {
  return (process.env.NEXT_PUBLIC_COMMENTS_ENABLED ?? 'true').toLowerCase() !== 'false';
}
