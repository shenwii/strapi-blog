import qs from 'qs';
import { getDefaultLocale, getStrapiApiToken, getStrapiInternalUrl, getStrapiPublicUrl } from './env';

export interface StrapiMedia {
  id: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
}

export interface StrapiSeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  shareImage?: StrapiMedia | null;
}

export interface NavLink {
  id?: number;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface GlobalConfig {
  documentId: string;
  portalTitle: string;
  portalSubtitle?: string | null;
  footerText?: string | null;
  defaultSiteSlug?: string | null;
  defaultTheme?: string | null;
  seo?: StrapiSeo | null;
}

export interface Site {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  badge?: string | null;
  tagline?: string | null;
  description?: string | null;
  accentColor?: string | null;
  theme?: string | null;
  sortOrder?: number;
  cover?: StrapiMedia | null;
  navLinks?: NavLink[];
  seo?: StrapiSeo | null;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
  site?: Site | null;
}

export interface Tag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  cover?: StrapiMedia | null;
  authorName?: string | null;
  publishedDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  readingTime?: number | null;
  featured?: boolean;
  allowComments?: boolean;
  locale?: string;
  site?: Site | null;
  category?: Category | null;
  tags?: Tag[];
  seo?: StrapiSeo | null;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
}

export interface StrapiSingleResponse<T> {
  data: T | null;
}

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const publicBase = getStrapiPublicUrl();
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return publicBase ? `${publicBase}${normalized}` : normalized;
}

async function fetchStrapi<T>(path: string, query?: Record<string, unknown>): Promise<T> {
  const baseUrl = getStrapiInternalUrl();
  const token = getStrapiApiToken();
  const queryString = query ? qs.stringify(query, { encodeValuesOnly: true }) : '';
  const url = `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Strapi request failed (${res.status} ${path}): ${body}`);
  }

  return (await res.json()) as T;
}

export async function getGlobalConfig(locale: string): Promise<GlobalConfig | null> {
  const defaultLocale = getDefaultLocale();
  try {
    const res = await fetchStrapi<StrapiSingleResponse<GlobalConfig>>('/api/global', {
      locale,
      populate: { seo: { populate: ['shareImage'] } },
    });
    if (res.data) return res.data;

    if (locale !== defaultLocale) {
      const fallback = await fetchStrapi<StrapiSingleResponse<GlobalConfig>>('/api/global', {
        locale: defaultLocale,
        populate: { seo: { populate: ['shareImage'] } },
      });
      return fallback.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSites(locale: string): Promise<Site[]> {
  const defaultLocale = getDefaultLocale();
  try {
    const res = await fetchStrapi<StrapiListResponse<Site>>('/api/sites', {
      locale,
      status: 'published',
      sort: ['sortOrder:asc', 'name:asc'],
      populate: {
        cover: true,
        navLinks: true,
      },
    });
    if (res.data.length > 0 || locale === defaultLocale) {
      return res.data;
    }
    const fallback = await fetchStrapi<StrapiListResponse<Site>>('/api/sites', {
      locale: defaultLocale,
      status: 'published',
      sort: ['sortOrder:asc', 'name:asc'],
      populate: {
        cover: true,
        navLinks: true,
      },
    });
    return fallback.data;
  } catch {
    return [];
  }
}

export async function getSiteBySlug(slug: string, locale: string): Promise<Site | null> {
  const defaultLocale = getDefaultLocale();
  try {
    const res = await fetchStrapi<StrapiListResponse<Site>>('/api/sites', {
      locale,
      status: 'published',
      filters: { slug: { $eq: slug } },
      populate: {
        cover: true,
        navLinks: true,
        seo: { populate: ['shareImage'] },
      },
      pagination: { page: 1, pageSize: 1 },
    });
    if (res.data[0]) return res.data[0];

    if (locale !== defaultLocale) {
      const fallback = await fetchStrapi<StrapiListResponse<Site>>('/api/sites', {
        locale: defaultLocale,
        status: 'published',
        filters: { slug: { $eq: slug } },
        populate: {
          cover: true,
          navLinks: true,
          seo: { populate: ['shareImage'] },
        },
        pagination: { page: 1, pageSize: 1 },
      });
      return fallback.data[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export interface ArticleQueryOptions {
  siteSlug?: string;
  locale: string;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getArticles(options: ArticleQueryOptions): Promise<{
  articles: Article[];
  pagination: StrapiPagination;
}> {
  const filters: Record<string, unknown> = {};

  if (options.siteSlug) {
    filters.site = { slug: { $eq: options.siteSlug } };
  }
  if (options.categorySlug) {
    filters.category = { slug: { $eq: options.categorySlug } };
  }
  if (options.tagSlug) {
    filters.tags = { slug: { $eq: options.tagSlug } };
  }
  if (options.featured !== undefined) {
    filters.featured = { $eq: options.featured };
  }
  if (options.search) {
    filters.$or = [
      { title: { $containsi: options.search } },
      { summary: { $containsi: options.search } },
      { content: { $containsi: options.search } },
    ];
  }

  const page = options.page || 1;
  const pageSize = options.pageSize || 10;

  try {
    const res = await fetchStrapi<StrapiListResponse<Article>>('/api/articles', {
      locale: options.locale,
      status: 'published',
      filters,
      sort: ['publishedDate:desc', 'publishedAt:desc'],
      populate: {
        cover: true,
        site: true,
        category: true,
        tags: true,
      },
      pagination: { page, pageSize },
    });

    return {
      articles: res.data,
      pagination: res.meta?.pagination || {
        page,
        pageSize,
        pageCount: 1,
        total: res.data.length,
      },
    };
  } catch {
    return {
      articles: [],
      pagination: { page, pageSize, pageCount: 1, total: 0 },
    };
  }
}

export async function getArticleBySlug(
  siteSlug: string,
  slug: string,
  locale: string
): Promise<{ article: Article | null; isFallbackLocale: boolean }> {
  const defaultLocale = getDefaultLocale();
  const queryBase = {
    status: 'published',
    filters: {
      slug: { $eq: slug },
      site: { slug: { $eq: siteSlug } },
    },
    populate: {
      cover: true,
      site: true,
      category: true,
      tags: true,
      seo: { populate: ['shareImage'] },
    },
    pagination: { page: 1, pageSize: 1 },
  };

  try {
    const res = await fetchStrapi<StrapiListResponse<Article>>('/api/articles', {
      locale,
      ...queryBase,
    });
    if (res.data[0]) {
      return { article: res.data[0], isFallbackLocale: false };
    }

    if (locale !== defaultLocale) {
      const fallback = await fetchStrapi<StrapiListResponse<Article>>('/api/articles', {
        locale: defaultLocale,
        ...queryBase,
      });
      if (fallback.data[0]) {
        return { article: fallback.data[0], isFallbackLocale: true };
      }
    }

    return { article: null, isFallbackLocale: false };
  } catch {
    return { article: null, isFallbackLocale: false };
  }
}

export async function getCategoriesBySite(siteSlug: string, locale: string): Promise<Category[]> {
  try {
    const res = await fetchStrapi<StrapiListResponse<Category>>('/api/categories', {
      locale,
      status: 'published',
      filters: {
        site: { slug: { $eq: siteSlug } },
      },
      sort: ['name:asc'],
      pagination: { page: 1, pageSize: 50 },
    });
    return res.data;
  } catch {
    return [];
  }
}

export async function getTags(locale: string): Promise<Tag[]> {
  try {
    const res = await fetchStrapi<StrapiListResponse<Tag>>('/api/tags', {
      locale,
      status: 'published',
      sort: ['name:asc'],
      pagination: { page: 1, pageSize: 100 },
    });
    return res.data;
  } catch {
    return [];
  }
}
