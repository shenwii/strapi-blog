import type { BlogTheme } from '../types';
import { ArticleDetailView } from './ArticleDetailView';
import { PortalView } from './PortalView';
import { SearchView } from './SearchView';
import { SiteHomeView } from './SiteHomeView';
import { TaxonomyView } from './TaxonomyView';

export const defaultTheme: BlogTheme = {
  name: 'default',
  PortalView,
  SiteHomeView,
  ArticleDetailView,
  TaxonomyView,
  SearchView,
};
