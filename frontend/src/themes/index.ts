import { createThemeFromSkin } from './createTheme';
import { THEME_SKINS, type ThemeName } from './skins';
import type { BlogTheme } from './types';

/**
 * Built-in theme registry selectable dynamically from Strapi Admin (Site.theme / Global.defaultTheme).
 * Built-in presets:
 * - default: Modern Editorial
 * - warm:    Warm Cozy Journal
 * - anime:   Anime Sakura Neon
 * - cyber:   Cyber Tech Matrix
 *
 * Developers who want a completely custom layout can also register a custom BlogTheme here
 * and rebuild the frontend Docker image.
 */
export const THEME_REGISTRY: Record<ThemeName, BlogTheme> = {
  default: createThemeFromSkin(THEME_SKINS.default),
  warm: createThemeFromSkin(THEME_SKINS.warm),
  anime: createThemeFromSkin(THEME_SKINS.anime),
  cyber: createThemeFromSkin(THEME_SKINS.cyber),
};

export function getTheme(name?: string | null): BlogTheme {
  if (name && name in THEME_REGISTRY) {
    return THEME_REGISTRY[name as ThemeName];
  }
  return THEME_REGISTRY.default;
}

export const activeTheme: BlogTheme = THEME_REGISTRY.default;
