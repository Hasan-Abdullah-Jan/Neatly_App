/**
 * i18n baseline for Neatly.
 *
 * Exports locale dictionaries and Intl helpers for dates, numbers, relative time.
 * i18next is the client-side runtime; this package provides the dictionaries.
 */

import en from './locales/en.json';
import psRTL from './locales/ps-RTL.json';

export const locales = {
  en,
  'ps-RTL': psRTL,
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = 'en';

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locales[locale].direction as 'ltr' | 'rtl';
}

export function getLanguage(locale: Locale): string {
  return locales[locale].language;
}

/**
 * Intl helpers — memoized formatters.
 */

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const numberFormatters = new Map<string, Intl.NumberFormat>();
const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>();

export function formatDate(
  value: Date | string,
  locale: string = defaultLocale,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const key = JSON.stringify({ locale, options });
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatters.set(key, formatter);
  }
  return formatter.format(new Date(value));
}

export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string = defaultLocale,
  options: Intl.RelativeTimeFormatOptions = {},
): string {
  const key = JSON.stringify({ locale, unit, options });
  let formatter = relativeTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, options);
    relativeTimeFormatters.set(key, formatter);
  }
  return formatter.format(value, unit);
}

export function formatNumber(
  value: number,
  locale: string = defaultLocale,
  options: Intl.NumberFormatOptions = {},
): string {
  const key = JSON.stringify({ locale, options });
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter.format(value);
}

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = defaultLocale,
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDuration(seconds: number, _locale: string = defaultLocale): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: Array<string> = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export { en, psRTL };
