/**
 * Theme controller.
 *
 * Reads/writes root data attributes (data-theme, data-glass, data-motion,
 * data-contrast), detects system preferences, and persists user overrides to
 * localStorage. Safe to call before React hydrates.
 */

import type {
  ThemeState,
  ThemeMode,
  GlassMode,
  MotionMode,
  ContrastMode,
} from './types';
import { storageKeys, systemMediaQueries } from './types';

const root =
  typeof document !== 'undefined' ? document.documentElement : null;

function getStored<K extends keyof ThemeState>(
  key: K,
): ThemeState[K] | undefined {
  if (typeof window === 'undefined' || !localStorage) return undefined;
  try {
    const raw = localStorage.getItem(storageKeys[key]);
    if (!raw) return undefined;
    return JSON.parse(raw) as ThemeState[K];
  } catch {
    return undefined;
  }
}

function setStored<K extends keyof ThemeState>(key: K, value: ThemeState[K]): void {
  if (typeof window === 'undefined' || !localStorage) return;
  try {
    localStorage.setItem(storageKeys[key], JSON.stringify(value));
  } catch {
    // localStorage may be disabled in private mode; ignore.
  }
}

function detectSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'auto';
  return window.matchMedia(systemMediaQueries.prefersDark).matches ? 'dark' : 'light';
}

function detectSystemMotion(): MotionMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'full';
  return window.matchMedia(systemMediaQueries.prefersReducedMotion).matches
    ? 'reduced'
    : 'full';
}

function detectSystemTransparency(): GlassMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'liquid';
  return window.matchMedia(systemMediaQueries.prefersReducedTransparency).matches
    ? 'lite'
    : 'liquid';
}

function detectSystemContrast(): ContrastMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'normal';
  return window.matchMedia(systemMediaQueries.prefersHighContrast).matches
    ? 'high'
    : 'normal';
}

/** Initial theme state: user override from localStorage, falling back to system
 * preference, falling back to defaults. */
export function initialThemeState(): ThemeState {
  const stored: Partial<ThemeState> = {
    theme: getStored('theme'),
    glass: getStored('glass'),
    motion: getStored('motion'),
    contrast: getStored('contrast'),
  };

  const systemTheme = detectSystemTheme();
  const systemMotion = detectSystemMotion();

  return {
    theme: (stored.theme as ThemeMode | undefined) ?? systemTheme,
    glass: (stored.glass as GlassMode | undefined) ??
      (systemMotion === 'reduced' ? 'lite' : detectSystemTransparency()),
    motion: (stored.motion as MotionMode | undefined) ?? systemMotion,
    contrast: (stored.contrast as ContrastMode | undefined) ??
      detectSystemContrast(),
  };
}

/** Apply a full theme state to the root element as data attributes. */
export function applyThemeState(state: ThemeState): void {
  if (!root) return;
  root.setAttribute('data-theme', state.theme);
  root.setAttribute('data-glass', state.glass);
  root.setAttribute('data-motion', state.motion);
  root.setAttribute('data-contrast', state.contrast);
}

/** Apply a single mode attribute. */
export function applyMode<K extends keyof ThemeState>(
  key: K,
  value: ThemeState[K],
): void {
  if (!root) return;
  const attrMap: Record<keyof ThemeState, string> = {
    theme: 'data-theme',
    glass: 'data-glass',
    motion: 'data-motion',
    contrast: 'data-contrast',
  };
  root.setAttribute(attrMap[key], String(value));
}

/** Persist a single mode override to localStorage and apply it. */
export function setMode<K extends keyof ThemeState>(key: K, value: ThemeState[K]): void {
  setStored(key, value);
  applyMode(key, value);
}

/**
 * Listen for system preference changes and update modes that the user has not
 * overridden. Returns an unsubscribe function.
 */
export function watchSystemPreferences(
  onChange: (state: ThemeState) => void,
): () => void {
  const handlers: Array<() => void> = [];

  const dark = window.matchMedia(systemMediaQueries.prefersDark);
  const motion = window.matchMedia(systemMediaQueries.prefersReducedMotion);
  const transparency = window.matchMedia(
    systemMediaQueries.prefersReducedTransparency,
  );
  const contrast = window.matchMedia(systemMediaQueries.prefersHighContrast);

  const update = () => {
    const storedTheme = getStored('theme');
    const theme = (storedTheme as ThemeMode | undefined) ??
      (dark.matches ? 'dark' : 'light');
    const storedMotion = getStored('motion');
    const motionMode = (storedMotion as MotionMode | undefined) ??
      (motion.matches ? 'reduced' : 'full');
    const storedGlass = getStored('glass');
    const glassMode = (storedGlass as GlassMode | undefined) ??
      (motionMode === 'reduced'
        ? 'lite'
        : transparency.matches
          ? 'lite'
          : 'liquid');
    const storedContrast = getStored('contrast');
    const contrastMode = (storedContrast as ContrastMode | undefined) ??
      (contrast.matches ? 'high' : 'normal');

    onChange({ theme, glass: glassMode, motion: motionMode, contrast: contrastMode });
  };

  for (const mq of [dark, motion, transparency, contrast]) {
    mq.addEventListener('change', update);
    handlers.push(() => mq.removeEventListener('change', update));
  }

  return () => {
    handlers.forEach((h) => h());
  };
}

export type {
  ThemeState,
  ThemeMode,
  GlassMode,
  MotionMode,
  ContrastMode,
};
