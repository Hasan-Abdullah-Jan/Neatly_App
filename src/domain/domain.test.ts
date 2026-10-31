import { describe, expect, it } from 'vitest';
import {
  addDays,
  addInterval,
  addMonths,
  agenda,
  choreFreshness,
  completeChore,
  describeFrequency,
  diffDays,
  dueNow,
  dueStatus,
  freshness,
  quickPlan,
  relativeDue,
  streak,
  templateForName,
  weekStats,
  type Chore,
  type Completion,
} from './index';

const TODAY = '2026-03-10';

function chore(over: Partial<Chore> = {}): Chore {
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Chore',
    spaceId: 's1',
    frequency: { every: 1, unit: 'week' },
    minutes: 10,
    assigneeId: null,
    notes: '',
    dueDate: TODAY,
    lastDone: null,
    paused: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

function done(date: string, over: Partial<Completion> = {}): Completion {
  return {
    id: Math.random().toString(36).slice(2),
    choreId: 'c',
    title: 'x',
    spaceId: 's1',
    date,
    at: `${date}T10:00:00.000Z`,
    minutes: 10,
    memberId: null,
    prev: { dueDate: date, lastDone: null },
    ...over,
  };
}

describe('dates', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('clamps month addition to the end of the month', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
  });

  it('counts days across DST changes', () => {
    expect(diffDays('2026-03-07', '2026-03-09')).toBe(2);
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2);
    expect(diffDays('2026-03-10', '2026-03-05')).toBe(-5);
  });

  it('adds intervals by unit', () => {
    expect(addInterval(TODAY, { every: 3, unit: 'day' })).toBe('2026-03-13');
    expect(addInterval(TODAY, { every: 2, unit: 'week' })).toBe('2026-03-24');
    expect(addInterval(TODAY, { every: 1, unit: 'month' })).toBe('2026-04-10');
  });

  it('describes frequencies and relative dates in plain language', () => {
    expect(describeFrequency({ every: 1, unit: 'day' })).toBe('Daily');
    expect(describeFrequency({ every: 2, unit: 'week' })).toBe('Every 2 weeks');
    expect(describeFrequency({ every: 3, unit: 'month' })).toBe('Every 3 months');
    expect(relativeDue(TODAY, TODAY)).toBe('Today');
    expect(relativeDue('2026-03-11', TODAY)).toBe('Tomorrow');
    expect(relativeDue('2026-03-07', TODAY)).toBe('3 days overdue');
  });
});

describe('scheduling', () => {
  it('classifies due status', () => {
    expect(dueStatus(chore({ dueDate: '2026-03-08' }), TODAY)).toBe('overdue');
    expect(dueStatus(chore(), TODAY)).toBe('today');
    expect(dueStatus(chore({ dueDate: '2026-03-12' }), TODAY)).toBe('soon');
    expect(dueStatus(chore({ dueDate: '2026-03-30' }), TODAY)).toBe('later');
    expect(dueStatus(chore({ paused: true }), TODAY)).toBe('paused');
  });

  it('schedules the next cycle from the day it was actually done', () => {
    const late = chore({ dueDate: '2026-03-01', frequency: { every: 1, unit: 'week' } });
    expect(completeChore(late, TODAY)).toEqual({ lastDone: TODAY, dueDate: '2026-03-17' });
  });

  it('orders due chores by urgency relative to their rhythm', () => {
    const daily = chore({ title: 'daily', frequency: { every: 1, unit: 'day' }, dueDate: '2026-03-08' });
    const monthly = chore({ title: 'monthly', frequency: { every: 1, unit: 'month' }, dueDate: '2026-03-01' });
    const future = chore({ title: 'future', dueDate: '2026-03-20' });
    const paused = chore({ title: 'paused', paused: true, dueDate: '2026-01-01' });
    expect(dueNow([monthly, daily, future, paused], TODAY).map((c) => c.title)).toEqual(['daily', 'monthly']);
  });

  it('computes freshness that decays after the due date', () => {
    expect(choreFreshness(chore({ dueDate: '2026-03-12' }), TODAY)).toBe(100);
    expect(choreFreshness(chore({ dueDate: '2026-03-03' }), TODAY)).toBe(50);
    expect(choreFreshness(chore({ dueDate: '2026-02-01' }), TODAY)).toBe(0);
    expect(freshness([], TODAY)).toBeNull();
    expect(freshness([chore({ dueDate: '2026-03-12' }), chore({ dueDate: '2026-03-03' })], TODAY)).toBe(75);
  });
});

describe('quickPlan', () => {
  it('fills the time budget with the most urgent chores first, then gets ahead', () => {
    const a = chore({ title: 'a', minutes: 10, dueDate: '2026-03-01' });
    const b = chore({ title: 'b', minutes: 20, dueDate: TODAY });
    const c = chore({ title: 'c', minutes: 5, dueDate: '2026-03-11' });
    const far = chore({ title: 'far', minutes: 1, dueDate: '2026-04-01' });
    const plan = quickPlan([b, c, a, far], 15, TODAY);
    expect(plan.items.map((x) => x.title)).toEqual(['a', 'c']);
    expect(plan.minutes).toBe(15);
    expect(plan.includesAhead).toBe(true);
  });

  it('returns an empty plan when nothing fits', () => {
    expect(quickPlan([chore({ minutes: 30 })], 5, TODAY).items).toHaveLength(0);
  });
});

describe('agenda', () => {
  it('places overdue chores on today and projects repeats', () => {
    const daily = chore({ title: 'daily', frequency: { every: 1, unit: 'day' }, dueDate: '2026-03-08' });
    const weekly = chore({ title: 'weekly', dueDate: '2026-03-12' });
    const days = agenda([daily, weekly], TODAY, 7);
    expect(days).toHaveLength(7);
    expect(days[0].items).toEqual([{ chore: daily, overdue: true }]);
    expect(days[1].items[0].overdue).toBe(false);
    expect(days[2].items.map((i) => i.chore.title)).toEqual(['daily', 'weekly']);
    expect(days[2].minutes).toBe(20);
    expect(days.filter((d) => d.items.some((i) => i.chore.title === 'daily'))).toHaveLength(7);
  });
});

describe('progress', () => {
  it('counts a streak ending today or yesterday', () => {
    expect(streak([done(TODAY), done('2026-03-09'), done('2026-03-08'), done('2026-03-06')], TODAY)).toBe(3);
    expect(streak([done('2026-03-09'), done('2026-03-08')], TODAY)).toBe(2);
    expect(streak([done('2026-03-07')], TODAY)).toBe(0);
  });

  it('summarises the last seven days by member', () => {
    const s = weekStats(
      [done(TODAY, { memberId: 'm1', minutes: 5 }), done('2026-03-04', { memberId: 'm2' }), done('2026-03-03')],
      TODAY,
    );
    expect(s.count).toBe(2);
    expect(s.minutes).toBe(15);
    expect(s.perDay[0]).toEqual({ date: '2026-03-04', count: 1 });
    expect(s.perDay[6]).toEqual({ date: TODAY, count: 1 });
    expect(s.byMember.get('m1')).toEqual({ count: 1, minutes: 5 });
  });
});

describe('templates', () => {
  it('matches common room names to starter routines', () => {
    expect(templateForName('Guest bathroom')?.key).toBe('bathroom');
    expect(templateForName('Master Bedroom')?.key).toBe('bedroom');
    expect(templateForName('Home office')?.key).toBe('office');
    expect(templateForName('Garage')).toBeUndefined();
  });
});
