import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addDays,
  completeChore,
  intervalDays,
  todayISO,
  type Chore,
  type Completion,
  type Frequency,
  type Member,
  type Space,
  type SpaceTemplate,
} from '../domain';

export const MEMBER_COLORS = ['#5B8DFF', '#F472B6', '#34D399', '#FBBF24', '#A78BFA', '#FB7185', '#22D3EE', '#F97316'];
const MAX_HISTORY = 3000;

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export interface ChoreInput {
  title: string;
  spaceId: string;
  frequency: Frequency;
  minutes: number;
  assigneeId: string | null;
  notes: string;
  dueDate: string;
}

export interface DataSnapshot {
  spaces: Space[];
  chores: Chore[];
  members: Member[];
  completions: Completion[];
}

interface DataState extends DataSnapshot {
  onboarded: boolean;
  /** Who is using this device — completions are credited to them. */
  currentMemberId: string | null;

  addSpace: (name: string, emoji: string) => string;
  updateSpace: (id: string, patch: Partial<Pick<Space, 'name' | 'emoji'>>) => void;
  deleteSpace: (id: string) => void;

  addChore: (input: ChoreInput) => string;
  addChoresFromTemplate: (spaceId: string, template: SpaceTemplate, titles?: string[]) => void;
  updateChore: (id: string, patch: Partial<ChoreInput>) => void;
  deleteChore: (id: string) => void;
  completeChore: (id: string) => string | null;
  undoCompletion: (completionId: string) => void;
  snoozeChore: (id: string, days: number) => void;
  setPaused: (id: string, paused: boolean) => void;

  addMember: (name: string) => string;
  updateMember: (id: string, patch: Partial<Pick<Member, 'name' | 'color'>>) => void;
  removeMember: (id: string) => void;
  setCurrentMember: (id: string | null) => void;

  setupHome: (rooms: Array<{ template: SpaceTemplate; name: string }>, memberNames: string[]) => void;
  finishOnboarding: () => void;
  importData: (data: unknown) => void;
  resetAll: () => void;
}

const EMPTY: DataSnapshot & { onboarded: boolean; currentMemberId: string | null } = {
  spaces: [],
  chores: [],
  members: [],
  completions: [],
  onboarded: false,
  currentMemberId: null,
};

/**
 * Spread first due dates so a fresh setup isn't one giant "everything is due
 * today" list: daily chores start today, longer cycles start within their window.
 */
function staggeredDue(f: Frequency, index: number, today: string): string {
  const span = Math.min(intervalDays(f), 7);
  return addDays(today, span <= 1 ? 0 : index % span);
}

function makeChores(spaceId: string, template: SpaceTemplate, startIndex: number, titles?: string[]): Chore[] {
  const today = todayISO();
  const now = new Date().toISOString();
  return template.chores
    .filter((c) => !titles || titles.includes(c.title))
    .map((c, i) => ({
      id: uid(),
      title: c.title,
      spaceId,
      frequency: { ...c.frequency },
      minutes: c.minutes,
      assigneeId: null,
      notes: '',
      dueDate: staggeredDue(c.frequency, startIndex + i, today),
      lastDone: null,
      paused: false,
      createdAt: now,
    }));
}

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      addSpace: (name, emoji) => {
        const id = uid();
        set((s) => ({ spaces: [...s.spaces, { id, name: name.trim(), emoji, createdAt: new Date().toISOString() }] }));
        return id;
      },
      updateSpace: (id, patch) =>
        set((s) => ({ spaces: s.spaces.map((sp) => (sp.id === id ? { ...sp, ...patch } : sp)) })),
      deleteSpace: (id) =>
        set((s) => ({
          spaces: s.spaces.filter((sp) => sp.id !== id),
          chores: s.chores.filter((c) => c.spaceId !== id),
        })),

      addChore: (input) => {
        const id = uid();
        const chore: Chore = {
          id,
          ...input,
          title: input.title.trim(),
          lastDone: null,
          paused: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ chores: [...s.chores, chore] }));
        return id;
      },
      addChoresFromTemplate: (spaceId, template, titles) =>
        set((s) => ({ chores: [...s.chores, ...makeChores(spaceId, template, s.chores.length, titles)] })),
      updateChore: (id, patch) =>
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, ...patch, title: (patch.title ?? c.title).trim() } : c)),
        })),
      deleteChore: (id) => set((s) => ({ chores: s.chores.filter((c) => c.id !== id) })),

      completeChore: (id) => {
        const chore = get().chores.find((c) => c.id === id);
        if (!chore) return null;
        const today = todayISO();
        const completion: Completion = {
          id: uid(),
          choreId: id,
          title: chore.title,
          spaceId: chore.spaceId,
          date: today,
          at: new Date().toISOString(),
          minutes: chore.minutes,
          memberId: get().currentMemberId,
          prev: { dueDate: chore.dueDate, lastDone: chore.lastDone },
        };
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, ...completeChore(c, today) } : c)),
          completions: [completion, ...s.completions].slice(0, MAX_HISTORY),
        }));
        return completion.id;
      },
      undoCompletion: (completionId) => {
        const completion = get().completions.find((c) => c.id === completionId);
        if (!completion) return;
        set((s) => ({
          completions: s.completions.filter((c) => c.id !== completionId),
          chores: s.chores.map((c) => (c.id === completion.choreId ? { ...c, ...completion.prev } : c)),
        }));
      },
      snoozeChore: (id, days) =>
        set((s) => ({
          chores: s.chores.map((c) => {
            if (c.id !== id) return c;
            const today = todayISO();
            const base = c.dueDate > today ? c.dueDate : today;
            return { ...c, dueDate: addDays(base, days) };
          }),
        })),
      setPaused: (id, paused) =>
        set((s) => ({
          chores: s.chores.map((c) => {
            if (c.id !== id) return c;
            // Resuming a long-paused chore shouldn't make it instantly "very overdue".
            const today = todayISO();
            return { ...c, paused, dueDate: !paused && c.dueDate < today ? today : c.dueDate };
          }),
        })),

      addMember: (name) => {
        const id = uid();
        set((s) => ({
          members: [...s.members, { id, name: name.trim(), color: MEMBER_COLORS[s.members.length % MEMBER_COLORS.length] }],
        }));
        return id;
      },
      updateMember: (id, patch) =>
        set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeMember: (id) =>
        set((s) => ({
          members: s.members.filter((m) => m.id !== id),
          chores: s.chores.map((c) => (c.assigneeId === id ? { ...c, assigneeId: null } : c)),
          currentMemberId: s.currentMemberId === id ? null : s.currentMemberId,
        })),
      setCurrentMember: (id) => set({ currentMemberId: id }),

      setupHome: (rooms, memberNames) => {
        const now = new Date().toISOString();
        const spaces: Space[] = [];
        let chores: Chore[] = [];
        for (const r of rooms) {
          const id = uid();
          spaces.push({ id, name: r.name, emoji: r.template.emoji, createdAt: now });
          chores = chores.concat(makeChores(id, r.template, chores.length));
        }
        const members: Member[] = memberNames
          .map((n) => n.trim())
          .filter(Boolean)
          .map((name, i) => ({ id: uid(), name, color: MEMBER_COLORS[i % MEMBER_COLORS.length] }));
        set((s) => ({
          spaces: [...s.spaces, ...spaces],
          chores: [...s.chores, ...chores],
          members: [...s.members, ...members],
          currentMemberId: s.currentMemberId ?? members[0]?.id ?? null,
          onboarded: true,
        }));
      },
      finishOnboarding: () => set({ onboarded: true }),

      importData: (raw) => {
        const data = parseBackup(raw);
        set({ ...data, onboarded: true, currentMemberId: data.members[0]?.id ?? null });
      },
      resetAll: () => set({ ...EMPTY }),
    }),
    {
      name: 'neatly-data',
      version: 1,
    },
  ),
);

/** Validate an exported backup file; throws with a readable message. */
export function parseBackup(raw: unknown): DataSnapshot {
  const fail = (msg: string): never => {
    throw new Error(`This doesn't look like a Neatly backup (${msg}).`);
  };
  if (!raw || typeof raw !== 'object') fail('not an object');
  const obj = raw as Record<string, unknown>;
  const data = (obj.app === 'neatly' && obj.data ? obj.data : obj) as Record<string, unknown>;
  for (const key of ['spaces', 'chores', 'members', 'completions'] as const) {
    if (!Array.isArray(data[key])) fail(`missing ${key}`);
  }
  const chores = data.chores as Chore[];
  for (const c of chores) {
    if (typeof c.id !== 'string' || typeof c.title !== 'string' || typeof c.dueDate !== 'string' || !c.frequency) {
      fail('invalid chore');
    }
  }
  return {
    spaces: data.spaces as Space[],
    chores,
    members: data.members as Member[],
    completions: data.completions as Completion[],
  };
}

export function exportBackup(): string {
  const { spaces, chores, members, completions } = useData.getState();
  return JSON.stringify(
    { app: 'neatly', version: 1, exportedAt: new Date().toISOString(), data: { spaces, chores, members, completions } },
    null,
    2,
  );
}
