import { addDays, addInterval, diffDays, intervalDays } from './dates';
import type { Chore, Completion, ISODate } from './types';

export type DueStatus = 'paused' | 'overdue' | 'today' | 'soon' | 'later';

/** Days past due (0 if not overdue). */
export function overdueDays(c: Chore, today: ISODate): number {
  return Math.max(0, diffDays(c.dueDate, today));
}

export function dueStatus(c: Chore, today: ISODate, soonDays = 3): DueStatus {
  if (c.paused) return 'paused';
  const d = diffDays(today, c.dueDate);
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  if (d <= soonDays) return 'soon';
  return 'later';
}

/**
 * Urgency relative to the chore's own rhythm: being 2 days late on a daily
 * chore matters more than being 2 days late on a monthly one.
 */
export function urgency(c: Chore, today: ISODate): number {
  return diffDays(c.dueDate, today) / intervalDays(c.frequency);
}

/** 0–100. Full until due, then decays; reaches 0 after two missed cycles. */
export function choreFreshness(c: Chore, today: ISODate): number {
  const late = overdueDays(c, today);
  if (late === 0) return 100;
  const ratio = late / intervalDays(c.frequency);
  return Math.max(0, Math.round(100 * (1 - ratio / 2)));
}

/** Average freshness of active chores, or null when there is nothing to measure. */
export function freshness(chores: Chore[], today: ISODate): number | null {
  const active = chores.filter((c) => !c.paused);
  if (active.length === 0) return null;
  const sum = active.reduce((acc, c) => acc + choreFreshness(c, today), 0);
  return Math.round(sum / active.length);
}

/** Active chores due today or earlier, most urgent first. */
export function dueNow(chores: Chore[], today: ISODate): Chore[] {
  return chores
    .filter((c) => !c.paused && c.dueDate <= today)
    .sort((a, b) => urgency(b, today) - urgency(a, today) || a.minutes - b.minutes);
}

/** Active chores due in the next `days` days (excluding today), soonest first. */
export function upcoming(chores: Chore[], today: ISODate, days: number): Chore[] {
  const end = addDays(today, days);
  return chores
    .filter((c) => !c.paused && c.dueDate > today && c.dueDate <= end)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.minutes - b.minutes);
}

/** Next state for a chore completed on `today`: the next cycle starts from today. */
export function completeChore(c: Chore, today: ISODate): Pick<Chore, 'dueDate' | 'lastDone'> {
  return { lastDone: today, dueDate: addInterval(today, c.frequency) };
}

export interface QuickPlan {
  items: Chore[];
  minutes: number;
  /** True when the plan includes chores that are not due yet ("get ahead"). */
  includesAhead: boolean;
}

/**
 * "I have N minutes" — picks the most urgent chores that fit the time budget,
 * then tops up with chores due in the next few days.
 */
export function quickPlan(chores: Chore[], budget: number, today: ISODate): QuickPlan {
  const items: Chore[] = [];
  let remaining = budget;
  let includesAhead = false;
  const take = (list: Chore[], ahead: boolean) => {
    for (const c of list) {
      if (c.minutes <= remaining) {
        items.push(c);
        remaining -= c.minutes;
        if (ahead) includesAhead = true;
      }
    }
  };
  take(dueNow(chores, today), false);
  take(upcoming(chores, today, 3), true);
  return { items, minutes: budget - remaining, includesAhead };
}

export interface AgendaItem {
  chore: Chore;
  overdue: boolean;
}

export interface AgendaDay {
  date: ISODate;
  items: AgendaItem[];
  minutes: number;
}

/**
 * Projects every active chore over the next `days` days. Overdue chores are
 * placed on today; later repeats assume the chore is done when scheduled.
 */
export function agenda(chores: Chore[], today: ISODate, days: number): AgendaDay[] {
  const end = addDays(today, days - 1);
  const map = new Map<ISODate, AgendaItem[]>();
  for (let i = 0; i < days; i++) map.set(addDays(today, i), []);

  for (const c of chores) {
    if (c.paused) continue;
    const overdue = c.dueDate < today;
    let date = overdue ? today : c.dueDate;
    let first = true;
    while (date <= end) {
      map.get(date)!.push({ chore: c, overdue: first && overdue });
      date = addInterval(date, c.frequency);
      first = false;
    }
  }

  return [...map.entries()].map(([date, items]) => ({
    date,
    items: items.sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.chore.title.localeCompare(b.chore.title)),
    minutes: items.reduce((acc, i) => acc + i.chore.minutes, 0),
  }));
}

/** Consecutive days with at least one completion, ending today (or yesterday if nothing yet today). */
export function streak(completions: Completion[], today: ISODate): number {
  const days = new Set(completions.map((c) => c.date));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export interface WeekStats {
  count: number;
  minutes: number;
  /** Seven entries, oldest first, ending today. */
  perDay: Array<{ date: ISODate; count: number }>;
  byMember: Map<string | null, { count: number; minutes: number }>;
}

export function weekStats(completions: Completion[], today: ISODate): WeekStats {
  const start = addDays(today, -6);
  const perDay = Array.from({ length: 7 }, (_, i) => ({ date: addDays(start, i), count: 0 }));
  const byMember = new Map<string | null, { count: number; minutes: number }>();
  let count = 0;
  let minutes = 0;
  for (const c of completions) {
    if (c.date < start || c.date > today) continue;
    count++;
    minutes += c.minutes;
    perDay[diffDays(start, c.date)].count++;
    const m = byMember.get(c.memberId) ?? { count: 0, minutes: 0 };
    m.count++;
    m.minutes += c.minutes;
    byMember.set(c.memberId, m);
  }
  return { count, minutes, perDay, byMember };
}
