/**
 * Inject CSS custom properties onto the root element based on the current
 * theme state. Call this whenever the theme changes.
 */

import type { ThemeName, GlassMode, MotionMode, ContrastMode } from './tokens';
import { generateCssVariables } from './tokens';

const root =
  typeof document !== 'undefined' ? document.documentElement : null;

/**
 * Apply generated CSS variables to the document root. Also sets the
 * `color-scheme` property so form controls follow the theme.
 */
export function applyCssVariables(params: {
  theme: ThemeName;
  glass: GlassMode;
  motion: MotionMode;
  contrast: ContrastMode;
}): void {
  if (!root) return;

  const vars = generateCssVariables(
    params.theme,
    params.glass,
    params.motion,
    params.contrast,
  );

  const existing = root.style;
  for (const [name, value] of Object.entries(vars)) {
    existing.setProperty(name, value);
  }

  root.style.colorScheme = params.theme === 'midnight' ? 'dark' : 'light';
}

/**
 * Returns the flat CSS variable object for server-side rendering or testing
 * without touching the DOM.
 */
export function cssVariablesFor(params: {
  theme: ThemeName;
  glass: GlassMode;
  motion: MotionMode;
  contrast: ContrastMode;
}): Record<string, string> {
  return generateCssVariables(
    params.theme,
    params.glass,
    params.motion,
    params.contrast,
  );
}

export type { ThemeName };
