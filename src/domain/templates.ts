import type { Frequency } from './types';

export interface ChoreTemplate {
  title: string;
  frequency: Frequency;
  minutes: number;
}

export interface SpaceTemplate {
  key: string;
  name: string;
  emoji: string;
  chores: ChoreTemplate[];
}

const d = (every: number): Frequency => ({ every, unit: 'day' });
const w = (every: number): Frequency => ({ every, unit: 'week' });
const m = (every: number): Frequency => ({ every, unit: 'month' });

/** Sensible starter routines so nobody begins with a blank page. */
export const SPACE_TEMPLATES: SpaceTemplate[] = [
  {
    key: 'kitchen',
    name: 'Kitchen',
    emoji: '🍳',
    chores: [
      { title: 'Wash dishes / run dishwasher', frequency: d(1), minutes: 15 },
      { title: 'Wipe counters', frequency: d(1), minutes: 5 },
      { title: 'Take out the trash', frequency: d(3), minutes: 5 },
      { title: 'Clean stovetop', frequency: w(1), minutes: 10 },
      { title: 'Mop the floor', frequency: w(1), minutes: 15 },
      { title: 'Clean the microwave', frequency: w(2), minutes: 10 },
      { title: 'Clear out the fridge', frequency: m(1), minutes: 20 },
    ],
  },
  {
    key: 'bathroom',
    name: 'Bathroom',
    emoji: '🛁',
    chores: [
      { title: 'Wipe sink and mirror', frequency: d(3), minutes: 5 },
      { title: 'Clean the toilet', frequency: w(1), minutes: 10 },
      { title: 'Scrub shower / tub', frequency: w(1), minutes: 20 },
      { title: 'Swap towels', frequency: w(1), minutes: 5 },
      { title: 'Mop the floor', frequency: w(1), minutes: 10 },
    ],
  },
  {
    key: 'bedroom',
    name: 'Bedroom',
    emoji: '🛏️',
    chores: [
      { title: 'Make the bed', frequency: d(1), minutes: 2 },
      { title: 'Put clothes away', frequency: d(2), minutes: 5 },
      { title: 'Change bed sheets', frequency: w(1), minutes: 15 },
      { title: 'Vacuum the floor', frequency: w(1), minutes: 10 },
      { title: 'Dust surfaces', frequency: w(2), minutes: 10 },
    ],
  },
  {
    key: 'living',
    name: 'Living room',
    emoji: '🛋️',
    chores: [
      { title: 'Quick tidy-up', frequency: d(1), minutes: 5 },
      { title: 'Vacuum', frequency: w(1), minutes: 15 },
      { title: 'Dust surfaces', frequency: w(1), minutes: 10 },
      { title: 'Clean windows', frequency: m(1), minutes: 20 },
    ],
  },
  {
    key: 'laundry',
    name: 'Laundry',
    emoji: '🧺',
    chores: [
      { title: 'Do a load of laundry', frequency: d(3), minutes: 15 },
      { title: 'Fold and put away', frequency: d(3), minutes: 10 },
      { title: 'Clean lint filter', frequency: w(1), minutes: 2 },
      { title: 'Clean the washing machine', frequency: m(1), minutes: 10 },
    ],
  },
  {
    key: 'office',
    name: 'Home office',
    emoji: '💻',
    chores: [
      { title: 'Clear the desk', frequency: d(1), minutes: 5 },
      { title: 'Empty the bin', frequency: w(1), minutes: 2 },
      { title: 'Wipe screens and keyboard', frequency: w(1), minutes: 5 },
    ],
  },
  {
    key: 'kids',
    name: "Kids' room",
    emoji: '🧸',
    chores: [
      { title: 'Tidy toys', frequency: d(1), minutes: 10 },
      { title: 'Change bed sheets', frequency: w(1), minutes: 15 },
      { title: 'Vacuum the floor', frequency: w(1), minutes: 10 },
    ],
  },
  {
    key: 'entry',
    name: 'Entryway',
    emoji: '🚪',
    chores: [
      { title: 'Sort shoes and mail', frequency: w(1), minutes: 5 },
      { title: 'Sweep the floor', frequency: w(1), minutes: 5 },
    ],
  },
  {
    key: 'outdoor',
    name: 'Balcony & plants',
    emoji: '🌿',
    chores: [
      { title: 'Water the plants', frequency: d(2), minutes: 5 },
      { title: 'Sweep the balcony', frequency: w(2), minutes: 10 },
    ],
  },
  {
    key: 'home',
    name: 'Whole home',
    emoji: '🏠',
    chores: [
      { title: 'Take out recycling', frequency: w(1), minutes: 5 },
      { title: 'Restock cleaning supplies', frequency: m(1), minutes: 10 },
      { title: 'Change air / AC filter', frequency: m(3), minutes: 10 },
      { title: 'Test smoke alarms', frequency: m(6), minutes: 5 },
    ],
  },
];

export const EMOJI_CHOICES = [
  '🍳', '🛁', '🛏️', '🛋️', '🧺', '💻', '🧸', '🚪', '🌿', '🏠',
  '🚗', '🐾', '🍽️', '📚', '🧹', '🪴', '🏢', '🏫', '🏥', '☕',
];

export function findTemplate(key: string): SpaceTemplate | undefined {
  return SPACE_TEMPLATES.find((t) => t.key === key);
}

/** Match a space name to the closest template (used for "suggested chores"). */
export function templateForName(name: string): SpaceTemplate | undefined {
  const n = name.toLowerCase();
  return (
    SPACE_TEMPLATES.find((t) => n.includes(t.name.toLowerCase())) ??
    SPACE_TEMPLATES.find((t) => n.includes(t.key)) ??
    (n.includes('bath') || n.includes('toilet') || n.includes('wc') ? findTemplate('bathroom') : undefined) ??
    (n.includes('bed') ? findTemplate('bedroom') : undefined) ??
    (n.includes('living') || n.includes('lounge') ? findTemplate('living') : undefined) ??
    (n.includes('kid') || n.includes('nursery') ? findTemplate('kids') : undefined)
  );
}
