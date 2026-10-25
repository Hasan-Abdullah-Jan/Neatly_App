/**
 * Unit tests for i18n helpers.
 */

import { describe, it, expect } from 'vitest';
import {
  getDirection,
  getLanguage,
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatDuration,
  locales,
  defaultLocale,
  en,
  psRTL,
} from './index';

describe('locales', () => {
  it('has en and ps-RTL locales', () => {
    expect(locales.en).toBeDefined();
    expect(locales['ps-RTL']).toBeDefined();
  });

  it('en direction is ltr', () => {
    expect(getDirection('en')).toBe('ltr');
  });

  it('ps-RTL direction is rtl', () => {
    expect(getDirection('ps-RTL')).toBe('rtl');
  });

  it('default locale is en', () => {
    expect(defaultLocale).toBe('en');
  });
});

describe('en locale', () => {
  it('has app name', () => {
    expect(en.app.name).toBe('Neatly');
  });
});

describe('ps-RTL locale', () => {
  it('has app name', () => {
    expect(psRTL.app.name).toBe('Neatly');
  });
});

describe('formatDate', () => {
  it('formats a date', () => {
    const result = formatDate('2026-01-15', 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toContain('2026');
  });
});

describe('formatRelativeTime', () => {
  it('formats relative time', () => {
    const result = formatRelativeTime(-1, 'day', 'en');
    expect(result).toMatch(/day/);
  });
});

describe('formatNumber', () => {
  it('formats a number', () => {
    expect(formatNumber(1000, 'en')).toBe('1,000');
  });
});

describe('formatCurrency', () => {
  it('formats currency', () => {
    expect(formatCurrency(1250, 'USD', 'en')).toBe('$1,250.00');
  });
});

describe('formatDuration', () => {
  it('formats seconds as h/m/s', () => {
    expect(formatDuration(3661)).toBe('1h 1m 1s');
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(90)).toBe('1m 30s');
  });
});
