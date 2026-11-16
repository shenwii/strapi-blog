import type React from 'react';
import type { Dictionary } from '@/lib/i18n';
import type { TocItem } from '@/lib/markdown';
import type { Article, Category, GlobalConfig, Site, StrapiPagination, Tag } from '@/lib/strapi';

export interface PortalViewProps {
  locale: string;
  supportedLocales: string[];
  dict: Dictionary;
  global: GlobalConfig | null;
  sites: Site[];
  recentArticles: Article[];
}

export interface SiteHomeViewProps {
  locale: string;
  supportedLocales: string[];
  dict: Dictionary;
  global: GlobalConfig | null;
  site: Site;
  allSites: Site[];
  categories: Category[];
  articles: Article[];
  pagination: StrapiPagination;
}

export interface ArticleDetailViewProps {
  locale: string;
  supportedLocales: string[];
  dict: Dictionary;
  global: GlobalConfig | null;
  site: Site;
  allSites: Site[];
  article: Article;
  renderedContent: string;
  toc: TocItem[];
  readingTime: number;
  isFallbackLocale: boolean;
  commentsEnabled: boolean;
}

export interface TaxonomyViewProps {
  locale: string;
  supportedLocales: string[];
  dict: Dictionary;
  global: GlobalConfig | null;
  site: Site;
  allSites: Site[];
  kind: 'category' | 'tag';
  taxonomyTitle: string;
  taxonomyDescription?: string | null;
  articles: Article[];
  pagination: StrapiPagination;
}

export interface SearchViewProps {
  locale: string;
  supportedLocales: string[];
  dict: Dictionary;
  global: GlobalConfig | null;
  site: Site;
  allSites: Site[];
  query: string;
  articles: Article[];
  pagination: StrapiPagination;
}

export interface BlogTheme {
  name: string;
  PortalView: React.ComponentType<PortalViewProps>;
  SiteHomeView: React.ComponentType<SiteHomeViewProps>;
  ArticleDetailView: React.ComponentType<ArticleDetailViewProps>;
  TaxonomyView: React.ComponentType<TaxonomyViewProps>;
  SearchView: React.ComponentType<SearchViewProps>;
}
