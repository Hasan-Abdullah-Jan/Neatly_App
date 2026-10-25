/**
 * Token type definitions for theme modes.
 */

export type ThemeMode = 'dark' | 'light' | 'auto';
export type GlassMode = 'liquid' | 'lite' | 'solid';
export type MotionMode = 'full' | 'reduced';
export type ContrastMode = 'normal' | 'high';

export interface ThemeState {
  theme: ThemeMode;
  glass: GlassMode;
  motion: MotionMode;
  contrast: ContrastMode;
}

export const storageKeys = {
  theme: 'neatly:theme',
  glass: 'neatly:glass',
  motion: 'neatly:motion',
  contrast: 'neatly:contrast',
};

export const systemMediaQueries = {
  prefersDark: '(prefers-color-scheme: dark)',
  prefersReducedMotion: '(prefers-reduced-motion: reduce)',
  prefersReducedTransparency: '(prefers-reduced-transparency: reduce)',
  prefersHighContrast: '(prefers-contrast: more)',
} as const;
