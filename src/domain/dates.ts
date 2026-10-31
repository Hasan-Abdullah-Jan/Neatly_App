import type { Frequency, ISODate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse YYYY-MM-DD as local midnight (never UTC). */
export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Add months, clamping to the last day of the target month (Jan 31 + 1 → Feb 28/29). */
export function addMonths(s: ISODate, n: number): ISODate {
  const d = parseISODate(s);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISODate(d);
}

/** Whole days from a to b (positive when b is later). DST-safe. */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86_400_000);
}

export function addInterval(s: ISODate, f: Frequency): ISODate {
  const n = Math.max(1, Math.floor(f.every));
  if (f.unit === 'day') return addDays(s, n);
  if (f.unit === 'week') return addDays(s, n * 7);
  return addMonths(s, n);
}

/** Approximate length of a frequency in days (used for urgency/freshness maths). */
export function intervalDays(f: Frequency): number {
  const n = Math.max(1, Math.floor(f.every));
  return f.unit === 'day' ? n : f.unit === 'week' ? n * 7 : n * 30;
}

export function describeFrequency(f: Frequency): string {
  const n = Math.max(1, Math.floor(f.every));
  if (n === 1) return f.unit === 'day' ? 'Daily' : f.unit === 'week' ? 'Weekly' : 'Monthly';
  if (f.unit === 'week' && n === 2) return 'Every 2 weeks';
  return `Every ${n} ${f.unit}s`;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function weekdayName(s: ISODate, short = false): string {
  const name = WEEKDAYS[parseISODate(s).getDay()];
  return short ? name.slice(0, 3) : name;
}

export function shortDate(s: ISODate): string {
  const d = parseISODate(s);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Human label for a due date relative to today: "Today", "2 days overdue", "Friday", "Mar 4". */
export function relativeDue(due: ISODate, today: ISODate): string {
  const d = diffDays(today, due);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  if (d < 0) return `${-d} days overdue`;
  if (d < 7) return weekdayName(due);
  return shortDate(due);
}

/** "Done today", "Done 3 days ago", "Never done". */
export function relativePast(date: ISODate | null, today: ISODate): string {
  if (!date) return 'Not done yet';
  const d = diffDays(date, today);
  if (d <= 0) return 'Done today';
  if (d === 1) return 'Done yesterday';
  return `Done ${d} days ago`;
}
