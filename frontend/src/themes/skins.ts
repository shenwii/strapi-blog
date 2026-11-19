export type ThemeName = 'default' | 'warm' | 'anime' | 'cyber';

export interface ThemeSkin {
  name: ThemeName;
  label: string;
  defaultAccent: string;
  pageWrapperClass: string;
  headerClass: string;
  subNavBorderClass: string;
  footerClass: string;
  heroClass: string;
  portalHeroClass: string;
  cardClass: string;
  panelClass: string;
  headingClass: string;
  titleGradientClass?: string;
  chipClass: string;
  chipActiveClass: string;
  primaryButtonClass: string;
  secondaryButtonClass: string;
  inputClass: string;
  variant: 'editorial' | 'warm' | 'anime' | 'cyber';
}

export const THEME_SKINS: Record<ThemeName, ThemeSkin> = {
  default: {
    name: 'default',
    label: 'Modern Editorial',
    defaultAccent: '#0ea5e9',
    pageWrapperClass: 'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
    headerClass:
      'border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85',
    subNavBorderClass: 'border-t border-slate-100 dark:border-slate-900',
    footerClass:
      'border-t border-slate-200/80 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-950/60',
    heroClass:
      'rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60',
    portalHeroClass:
      'rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-sky-50/60 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-sky-950/20',
    cardClass:
      'rounded-2xl border border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800/90 dark:bg-slate-900/70 dark:hover:border-slate-700',
    panelClass:
      'rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50',
    headingClass: 'tracking-tight text-slate-900 dark:text-slate-100',
    chipClass:
      'rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700',
    chipActiveClass: 'rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    primaryButtonClass:
      'rounded-2xl bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300',
    secondaryButtonClass:
      'rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white',
    inputClass:
      'rounded-2xl border border-slate-200 bg-white text-slate-900 focus:border-[var(--site-accent,#0ea5e9)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
    variant: 'editorial',
  },

  warm: {
    name: 'warm',
    label: 'Warm Cozy Journal',
    defaultAccent: '#d97706',
    pageWrapperClass: 'bg-[#fbf7f0] text-[#2c221b] dark:bg-[#191410] dark:text-[#f5ede2]',
    headerClass:
      'border-b border-amber-200/70 bg-[#fbf7f0]/90 backdrop-blur-md dark:border-amber-900/40 dark:bg-[#191410]/90',
    subNavBorderClass: 'border-t border-amber-200/50 dark:border-amber-900/30',
    footerClass:
      'border-t border-amber-200/70 bg-[#f6efe3] dark:border-amber-900/40 dark:bg-[#14100d]',
    heroClass:
      'rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-[#fffdf9] via-[#fdf7ec] to-[#f8ebd5]/70 shadow-sm dark:border-amber-900/50 dark:from-[#231c16] dark:via-[#1e1813] dark:to-[#291e14]',
    portalHeroClass:
      'rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-[#fffdf8] via-[#fdf4e6] to-[#fae7cd] shadow-sm dark:border-amber-900/50 dark:from-[#241c15] dark:via-[#1d1712] dark:to-[#2c2015]',
    cardClass:
      'rounded-3xl border border-amber-200/75 bg-[#fffdf9] shadow-sm hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-amber-900/45 dark:bg-[#221b15] dark:hover:border-amber-700/60',
    panelClass:
      'rounded-3xl border border-amber-200/75 bg-[#f7efe3]/85 dark:border-amber-900/45 dark:bg-[#211a14]/85',
    headingClass: 'font-editorial-serif tracking-tight text-[#2c221b] dark:text-[#f7efe4]',
    chipClass:
      'rounded-full border border-amber-200/80 bg-[#fffaf2] text-[#6b5340] hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-[#261e17] dark:text-amber-200/80 dark:hover:border-amber-700',
    chipActiveClass: 'rounded-full bg-[#8c4a1c] text-white dark:bg-amber-500 dark:text-[#191410]',
    primaryButtonClass:
      'rounded-full bg-[#8c4a1c] text-white hover:bg-[#723b14] dark:bg-amber-500 dark:text-[#191410] dark:hover:bg-amber-400',
    secondaryButtonClass:
      'rounded-full border border-amber-200/80 bg-[#fffdf9] text-[#6b5340] hover:border-amber-300 hover:text-[#2c221b] dark:border-amber-900/50 dark:bg-[#221b15] dark:text-amber-200/80 dark:hover:text-white',
    inputClass:
      'rounded-2xl border border-amber-200/80 bg-[#fffdf9] text-[#2c221b] focus:border-[var(--site-accent,#d97706)] dark:border-amber-900/50 dark:bg-[#221b15] dark:text-[#f5ede2]',
    variant: 'warm',
  },

  anime: {
    name: 'anime',
    label: 'Anime Sakura Neon',
    defaultAccent: '#ec4899',
    pageWrapperClass:
      'bg-[#fff8fc] bg-anime-dots text-slate-900 dark:bg-[#120e1c] dark:text-slate-100',
    headerClass:
      'border-b-2 border-pink-200/80 bg-white/85 backdrop-blur-md dark:border-fuchsia-900/60 dark:bg-[#171126]/85',
    subNavBorderClass: 'border-t border-pink-100 dark:border-fuchsia-950/80',
    footerClass:
      'border-t-2 border-pink-200/70 bg-gradient-to-r from-pink-50/80 via-white to-violet-50/80 dark:border-fuchsia-900/50 dark:from-[#171126] dark:via-[#140f21] dark:to-[#1a122b]',
    heroClass:
      'rounded-3xl border-2 border-pink-300/80 bg-gradient-to-br from-white via-pink-50/70 to-violet-50/80 shadow-[6px_6px_0px_rgba(236,72,153,0.18)] dark:border-pink-500/40 dark:from-[#1b142c] dark:via-[#1f1533] dark:to-[#171b36] dark:shadow-[6px_6px_0px_rgba(236,72,153,0.22)]',
    portalHeroClass:
      'rounded-3xl border-2 border-pink-300/80 bg-gradient-to-br from-pink-50 via-white to-indigo-50 shadow-[6px_6px_0px_rgba(168,85,247,0.18)] dark:border-fuchsia-500/40 dark:from-[#1f1430] dark:via-[#171229] dark:to-[#141c38]',
    cardClass:
      'rounded-2xl border-2 border-pink-200/90 bg-white/95 shadow-[4px_4px_0px_rgba(236,72,153,0.14)] hover:-translate-y-1 hover:border-pink-400 hover:shadow-[6px_6px_0px_rgba(236,72,153,0.24)] dark:border-fuchsia-800/70 dark:bg-[#1a1429]/90 dark:shadow-[4px_4px_0px_rgba(168,85,247,0.2)] dark:hover:border-pink-400/70',
    panelClass:
      'rounded-2xl border-2 border-pink-200/80 bg-white/85 dark:border-fuchsia-900/60 dark:bg-[#1a1429]/80',
    headingClass: 'tracking-tight text-slate-900 dark:text-white',
    titleGradientClass:
      'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent',
    chipClass:
      'rounded-full border-2 border-pink-200/80 bg-white text-pink-700 hover:border-pink-400 hover:bg-pink-50 dark:border-fuchsia-800/70 dark:bg-[#211936] dark:text-pink-200 dark:hover:border-pink-400',
    chipActiveClass:
      'rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-sm',
    primaryButtonClass:
      'rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-sm hover:opacity-90',
    secondaryButtonClass:
      'rounded-xl border-2 border-pink-200/80 bg-white text-pink-600 hover:border-pink-400 hover:text-pink-700 dark:border-fuchsia-800/70 dark:bg-[#211936] dark:text-pink-300 dark:hover:border-pink-400',
    inputClass:
      'rounded-2xl border-2 border-pink-200 bg-white text-slate-900 focus:border-pink-500 dark:border-fuchsia-800/70 dark:bg-[#1a1429] dark:text-slate-100',
    variant: 'anime',
  },

  cyber: {
    name: 'cyber',
    label: 'Cyber Tech Matrix',
    defaultAccent: '#06b6d4',
    pageWrapperClass:
      'bg-slate-100 bg-cyber-grid text-slate-900 dark:bg-[#050914] dark:text-slate-100',
    headerClass:
      'border-b border-cyan-500/25 bg-white/90 backdrop-blur-md dark:border-cyan-500/25 dark:bg-[#070d1d]/90',
    subNavBorderClass: 'border-t border-cyan-500/15',
    footerClass:
      'border-t border-cyan-500/25 bg-slate-50/90 dark:border-cyan-500/20 dark:bg-[#040711]/95',
    heroClass:
      'rounded-xl border border-cyan-500/35 bg-white/95 shadow-[0_0_30px_rgba(6,182,212,0.08)] dark:border-cyan-400/30 dark:bg-[#0a1224]/95 dark:shadow-[0_0_35px_rgba(6,182,212,0.12)]',
    portalHeroClass:
      'rounded-xl border border-cyan-500/35 bg-gradient-to-br from-white via-cyan-50/40 to-emerald-50/40 dark:border-cyan-400/30 dark:from-[#0a1224] dark:via-[#070d1b] dark:to-[#081a24]',
    cardClass:
      'rounded-xl border border-slate-300/80 bg-white/95 hover:-translate-y-0.5 hover:border-cyan-500/70 hover:shadow-[0_0_24px_rgba(6,182,212,0.14)] dark:border-cyan-500/20 dark:bg-[#0a1224]/90 dark:hover:border-cyan-400/60',
    panelClass:
      'rounded-xl border border-cyan-500/25 bg-white/90 dark:border-cyan-500/25 dark:bg-[#0a1224]/90',
    headingClass: 'tracking-tight text-slate-900 dark:text-cyan-50',
    chipClass:
      'rounded-md border border-cyan-500/30 bg-cyan-500/5 font-mono text-cyan-700 hover:border-cyan-500/60 hover:bg-cyan-500/15 dark:text-cyan-300',
    chipActiveClass:
      'rounded-md bg-cyan-500 font-mono text-slate-950 font-semibold',
    primaryButtonClass:
      'rounded-lg bg-cyan-500 font-mono font-semibold text-slate-950 hover:bg-cyan-400',
    secondaryButtonClass:
      'rounded-lg border border-cyan-500/30 bg-white/90 text-cyan-700 hover:border-cyan-500/60 dark:bg-[#0a1224] dark:text-cyan-300 dark:hover:border-cyan-400',
    inputClass:
      'rounded-lg border border-cyan-500/30 bg-white font-mono text-slate-900 focus:border-cyan-400 dark:bg-[#0a1224] dark:text-cyan-50',
    variant: 'cyber',
  },
};

export function resolveThemeSkin(themeName?: string | null): ThemeSkin {
  if (themeName && themeName in THEME_SKINS) {
    return THEME_SKINS[themeName as ThemeName];
  }
  return THEME_SKINS.default;
}
