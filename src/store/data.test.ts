import { beforeEach, describe, expect, it } from 'vitest';
import { addDays, findTemplate, todayISO } from '../domain';
import { exportBackup, parseBackup, useData } from './data';

const store = () => useData.getState();

beforeEach(() => {
  localStorage.clear();
  store().resetAll();
});

describe('data store', () => {
  it('sets up a home from templates with staggered due dates', () => {
    store().setupHome([{ template: findTemplate('kitchen')!, name: 'Kitchen' }], ['Hasan', ' ', 'Sara']);
    const { spaces, chores, members, currentMemberId, onboarded } = store();
    expect(onboarded).toBe(true);
    expect(spaces).toHaveLength(1);
    expect(chores).toHaveLength(findTemplate('kitchen')!.chores.length);
    expect(members.map((m) => m.name)).toEqual(['Hasan', 'Sara']);
    expect(currentMemberId).toBe(members[0].id);
    // Not everything should land on day one.
    expect(new Set(chores.map((c) => c.dueDate)).size).toBeGreaterThan(1);
    chores.filter((c) => c.frequency.unit === 'day' && c.frequency.every === 1).forEach((c) => expect(c.dueDate).toBe(todayISO()));
  });

  it('completes a chore, credits the current person, and can undo', () => {
    const spaceId = store().addSpace('Bathroom', '🛁');
    const memberId = store().addMember('Sara');
    store().setCurrentMember(memberId);
    const id = store().addChore({
      title: 'Clean toilet',
      spaceId,
      frequency: { every: 1, unit: 'week' },
      minutes: 10,
      assigneeId: null,
      notes: '',
      dueDate: addDays(todayISO(), -3),
    });

    const completionId = store().completeChore(id)!;
    let chore = store().chores[0];
    expect(chore.lastDone).toBe(todayISO());
    expect(chore.dueDate).toBe(addDays(todayISO(), 7));
    expect(store().completions[0]).toMatchObject({ choreId: id, memberId, minutes: 10, title: 'Clean toilet' });

    store().undoCompletion(completionId);
    chore = store().chores[0];
    expect(chore.dueDate).toBe(addDays(todayISO(), -3));
    expect(chore.lastDone).toBeNull();
    expect(store().completions).toHaveLength(0);
  });

  it('snoozes from today for overdue chores and resumes paused chores without a backlog', () => {
    const spaceId = store().addSpace('Kitchen', '🍳');
    const id = store().addChore({
      title: 'Mop',
      spaceId,
      frequency: { every: 1, unit: 'week' },
      minutes: 15,
      assigneeId: null,
      notes: '',
      dueDate: addDays(todayISO(), -10),
    });
    store().snoozeChore(id, 1);
    expect(store().chores[0].dueDate).toBe(addDays(todayISO(), 1));

    store().updateChore(id, { dueDate: addDays(todayISO(), -20) });
    store().setPaused(id, true);
    store().setPaused(id, false);
    expect(store().chores[0].dueDate).toBe(todayISO());
  });

  it('unassigns chores when a person is removed and deletes chores with their space', () => {
    const spaceId = store().addSpace('Office', '💻');
    const memberId = store().addMember('Ali');
    store().addChore({ title: 'Desk', spaceId, frequency: { every: 1, unit: 'day' }, minutes: 5, assigneeId: memberId, notes: '', dueDate: todayISO() });
    store().removeMember(memberId);
    expect(store().chores[0].assigneeId).toBeNull();
    store().deleteSpace(spaceId);
    expect(store().chores).toHaveLength(0);
  });

  it('round-trips a backup and rejects invalid files', () => {
    store().setupHome([{ template: findTemplate('bathroom')!, name: 'Bathroom' }], ['Me']);
    const json = JSON.parse(exportBackup());
    store().resetAll();
    expect(store().chores).toHaveLength(0);
    store().importData(json);
    expect(store().chores).toHaveLength(findTemplate('bathroom')!.chores.length);
    expect(() => parseBackup({ hello: 'world' })).toThrow(/Neatly backup/);
    expect(() => parseBackup({ spaces: [], members: [], completions: [], chores: [{ id: 1 }] })).toThrow(/invalid chore/);
  });
});
