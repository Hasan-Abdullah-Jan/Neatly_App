/**
 * Unit tests for design tokens.
 *
 * Verifies that CSS variable generation produces correct values for every
 * theme/glass/mode/contrast combination.
 */

import { describe, it, expect } from 'vitest';
import {
  generateCssVariables,
  themes,
  midnightColors,
  daybreakColors,
  accents,
  spacing,
  motion,
  radii,
  resolveTheme,
} from './tokens';
import type { ThemeName, GlassMode, MotionMode, ContrastMode } from './types';

describe('generateCssVariables', () => {
  it('produces color variables for midnight theme', () => {
    const vars = generateCssVariables(
      'midnight',
      'liquid',
      'full',
      'normal',
    );
    expect(vars['color-background']).toBe('#11141D');
    expect(vars['color-liquid-blue']).toBe('#A8C5FF');
    expect(vars['color-foreground']).toBe('#F5F7FA');
  });

  it('produces color variables for daybreak theme', () => {
    const vars = generateCssVariables(
      'daybreak',
      'liquid',
      'full',
      'normal',
    );
    expect(vars['color-background']).toBe('#FAFBFE');
    expect(vars['color-liquid-blue']).toBe('#2F6FF5');
    expect(vars['color-foreground']).toBe('#11141D');
  });

  it('produces accent variables', () => {
    const vars = generateCssVariables(
      'midnight',
      'liquid',
      'full',
      'normal',
    );
    expect(vars['accent-focus']).toBe('#3B82F6');
    expect(vars['accent-organize']).toBe('#22C55E');
    expect(vars['accent-reflect']).toBe('#F59E0B');
    expect(vars['accent-creative']).toBe('#C084FC');
  });

  it('produces spacing variables', () => {
    const vars = generateCssVariables(
      'midnight',
      'liquid',
      'full',
      'normal',
    );
    expect(vars['space-4']).toBe('16px');
    expect(vars['space-8']).toBe('32px');
  });

  it('produces motion duration variables', () => {
    const vars = generateCssVariables(
      'midnight',
      'liquid',
      'full',
      'normal',
    );
    expect(vars['motion-duration-press']).toBe('120ms');
    expect(vars['motion-duration-release']).toBe('280ms');
    expect(vars['motion-duration-panel']).toBe('320ms');
    expect(vars['motion-duration-page']).toBe('360ms');
  });

  it('produces radius variables', () => {
    const vars = generateCssVariables(
      'midnight',
      'liquid',
      'full',
      'normal',
    );
    expect(vars['radius-xl']).toBe('24px');
    expect(vars['radius-2xl']).toBe('28px');
    expect(vars['radius-pill']).toBe('9999px');
  });

  it('sets theme/glass/mode/contrast flags', () => {
    const vars = generateCssVariables(
      'daybreak',
      'lite',
      'reduced',
      'high',
    );
    expect(vars['theme']).toBe('daybreak');
    expect(vars['glass']).toBe('lite');
    expect(vars['motion-mode']).toBe('reduced');
    expect(vars['contrast']).toBe('high');
  });
});

describe('resolveTheme', () => {
  it('resolves auto to midnight when prefers dark', () => {
    expect(resolveTheme('auto', true)).toBe('midnight');
  });

  it('resolves auto to daybreak when prefers light', () => {
    expect(resolveTheme('auto', false)).toBe('daybreak');
  });

  it('respects explicit dark', () => {
    expect(resolveTheme('dark', true)).toBe('midnight');
    expect(resolveTheme('dark', false)).toBe('midnight');
  });

  it('respects explicit light', () => {
    expect(resolveTheme('light', true)).toBe('daybreak');
    expect(resolveTheme('light', false)).toBe('daybreak');
  });
});

describe('themes export', () => {
  it('has midnight and daybreak themes', () => {
    expect(Object.keys(themes)).toContain('midnight');
    expect(Object.keys(themes)).toContain('daybreak');
  });
});

describe('color palettes', () => {
  it('midnight has expected keys', () => {
    expect(midnightColors.background).toBe('#11141D');
    expect(midnightColors.glassDeep).toBe('#242B3A');
  });

  it('daybreak has expected keys', () => {
    expect(daybreakColors.background).toBe('#FAFBFE');
    expect(daybreakColors.glassDeep).toBe('#FFFFFF');
  });
});
