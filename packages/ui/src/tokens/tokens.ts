/**
 * Neatly Design Tokens
 *
 * Defines the complete design system as both TypeScript values and CSS custom
 * properties. Every animation duration, spacing value, color and radius in the
 * app must come from here — never hard-coded.
 */

import type { ThemeMode, GlassMode, MotionMode, ContrastMode } from './types';

/* ------------------------------------------------------------------ */
/* Base palette                                                       */
/* ------------------------------------------------------------------ */

/** Midnight (dark) theme — the default. */
export const midnightColors = {
  background: '#11141D',
  backgroundSecondary: '#171B27',
  glassDeep: '#242B3A',
  glassSurface: '#2A3345',
  glassBorder: '#333E52',
  liquidBlue: '#A8C5FF',
  liquidBlueDim: '#7E9EFF',
  softLavender: '#C9B5F4',
  softLavenderDim: '#A882F0',
  cloud: '#D8E3F7',
  cloudDim: '#B7C9E0',
  foreground: '#F5F7FA',
  foregroundSecondary: '#C9D2E0',
  foregroundMuted: '#8A97B0',
  inverse: '#11141D',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#FB7185',
  info: '#60A5FA',
  overlay: 'rgba(17, 20, 29, 0.6)',
  scrim: 'rgba(17, 20, 29, 0.45)',
} as const;

/** Daybreak (light) theme — same character, accessible contrast. */
export const daybreakColors = {
  background: '#FAFBFE',
  backgroundSecondary: '#F3F5F9',
  glassDeep: '#FFFFFF',
  glassSurface: '#F7F9FD',
  glassBorder: '#D8DEE8',
  liquidBlue: '#2F6FF5',
  liquidBlueDim: '#1E5AD9',
  softLavender: '#7C5CFA',
  softLavenderDim: '#5E3DE6',
  cloud: '#EAF0FA',
  cloudDim: '#CAD4E8',
  foreground: '#11141D',
  foregroundSecondary: '#3B465A',
  foregroundMuted: '#6B7588',
  inverse: '#FAFBFE',
  success: '#15803D',
  warning: '#B45309',
  error: '#B91C1C',
  info: '#1D4ED8',
  overlay: 'rgba(250, 251, 254, 0.6)',
  scrim: 'rgba(250, 251, 254, 0.45)',
} as const;

/** Contextual accents. The base never changes; only the accent. */
export const accents = {
  focus: { base: '#3B82F6', dim: '#2563EB' },
  organize: { base: '#22C55E', dim: '#16A34A' },
  reflect: { base: '#F59E0B', dim: '#D97706' },
  creative: { base: '#C084FC', dim: '#A855F7' },
} as const;

/* ------------------------------------------------------------------ */
/* Spacing (4-pt scale)                                               */
/* ------------------------------------------------------------------ */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

/* ------------------------------------------------------------------ */
/* Elevation (3 layers)                                               */
/* ------------------------------------------------------------------ */
export const elevation = {
  1: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 1px -0.5px rgba(0, 0, 0, 0.03)',
  2: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  3: '0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
} as const;

/* ------------------------------------------------------------------ */
/* Blur steps                                                         */
/* ------------------------------------------------------------------ */
export const blur = {
  sm: '8px',
  md: '16px',
  lg: '28px',
} as const;

/* ------------------------------------------------------------------ */
/* Type scale (tabular numerals)                                      */
/* ------------------------------------------------------------------ */
export const type = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  font: {
    sans: ['Inter', 'system-ui', 'sans-serif'].join(','),
    display: ['Manrope', 'system-ui', 'sans-serif'].join(','),
    mono: ['ui-monospace', 'SFMono-Regular', 'monospace'].join(','),
  },
  tabularNumerals: 'tabular-nums',
} as const;

/* ------------------------------------------------------------------ */
/* Radii                                                              */
/* ------------------------------------------------------------------ */
export const radii = {
  none: '0',
  sm: '6px',
  base: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '28px',
  pill: '9999px',
  full: '9999px',
} as const;

/* ------------------------------------------------------------------ */
/* Motion constants                                                   */
/* ------------------------------------------------------------------ */
export const motion = {
  press: 120,
  release: 280,
  panel: 320,
  page: 360,
  easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
  springs: {
    soft: { type: 'spring', stiffness: 260, damping: 20 },
    snappy: { type: 'spring', stiffness: 420, damping: 28 },
    settle: { type: 'spring', stiffness: 500, damping: 32 },
  },
} as const;

/* ------------------------------------------------------------------ */
/* z-index scale                                                      */
/* ------------------------------------------------------------------ */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 100,
  sticky: 200,
  banner: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
} as const;

/* ------------------------------------------------------------------ */
/* Theme name                                                         */
/* ------------------------------------------------------------------ */
export type ThemeName = 'midnight' | 'daybreak';

export interface ThemeColors {
  readonly background: string;
  readonly backgroundSecondary: string;
  readonly glassDeep: string;
  readonly glassSurface: string;
  readonly glassBorder: string;
  readonly liquidBlue: string;
  readonly liquidBlueDim: string;
  readonly softLavender: string;
  readonly softLavenderDim: string;
  readonly cloud: string;
  readonly cloudDim: string;
  readonly foreground: string;
  readonly foregroundSecondary: string;
  readonly foregroundMuted: string;
  readonly inverse: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
  readonly overlay: string;
  readonly scrim: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  midnight: midnightColors,
  daybreak: daybreakColors,
};

/** Resolve the effective theme name given data-theme and system preference. */
export function resolveTheme(dataTheme: ThemeMode, prefersDark: boolean): ThemeName {
  if (dataTheme === 'auto') return prefersDark ? 'midnight' : 'daybreak';
  return dataTheme === 'dark' ? 'midnight' : 'daybreak';
}

/* ------------------------------------------------------------------ */
/* CSS custom property generator                                      */
/* ------------------------------------------------------------------ */

/**
 * Build the complete CSS variable map for a theme. Returns a record of
 * custom property names to values, ready to inject on :root / [data-theme].
 */
export function generateCssVariables(
  themeName: ThemeName,
  glassMode: GlassMode,
  motionMode: MotionMode,
  contrastMode: ContrastMode,
): Record<string, string> {
  const colors = themes[themeName];
  const vars: Record<string, string> = {};

  function kebabCase(s: string): string {
    return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  }

  Object.entries(colors).forEach(([key, value]) => {
    vars[`color-${kebabCase(key)}`] = value;
  });

  Object.entries(accents).forEach(([accent, shades]) => {
    vars[`accent-${kebabCase(accent)}`] = shades.base;
    vars[`accent-${kebabCase(accent)}-dim`] = shades.dim;
  });

  Object.entries(spacing).forEach(([key, value]) => {
    vars[`space-${key}`] = value;
  });

  Object.entries(elevation).forEach(([key, value]) => {
    vars[`elevation-${key}`] = value;
  });

  Object.entries(blur).forEach(([key, value]) => {
    vars[`blur-${key}`] = value;
  });

  Object.entries(type).forEach(([key, value]) => {
    if (key === 'weight' || key === 'font') return;
    vars[`type-${kebabCase(key)}`] = String(value);
  });
  vars['type-weight-light'] = String(type.weight.light);
  vars['type-weight-normal'] = String(type.weight.normal);
  vars['type-weight-medium'] = String(type.weight.medium);
  vars['type-weight-semibold'] = String(type.weight.semibold);
  vars['type-weight-bold'] = String(type.weight.bold);
  vars['type-font-sans'] = type.font.sans;
  vars['type-font-display'] = type.font.display;
  vars['type-font-mono'] = type.font.mono;

  Object.entries(radii).forEach(([key, value]) => {
    vars[`radius-${kebabCase(key)}`] = value;
  });

  vars['motion-duration-press'] = `${motion.press}ms`;
  vars['motion-duration-release'] = `${motion.release}ms`;
  vars['motion-duration-panel'] = `${motion.panel}ms`;
  vars['motion-duration-page'] = `${motion.page}ms`;
  vars['motion-easing'] = motion.easing;
  vars['motion-mode'] = motionMode;

  Object.entries(zIndex).forEach(([key, value]) => {
    vars[`z-${key}`] = String(value);
  });

  vars['theme'] = themeName;
  vars['glass'] = glassMode;
  vars['contrast'] = contrastMode;

  return vars;
}

export type { ThemeMode, GlassMode, MotionMode, ContrastMode };
