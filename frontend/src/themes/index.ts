import { defaultTheme } from './default';
import type { BlogTheme } from './types';

/**
 * Active frontend theme.
 * To install or build a custom theme:
 * 1. Create a folder under src/themes/<your-theme>/ implementing BlogTheme (see src/themes/types.ts).
 * 2. Export it here as activeTheme.
 * 3. Rebuild the frontend Docker image: `docker compose build frontend`.
 */
export const activeTheme: BlogTheme = defaultTheme;
