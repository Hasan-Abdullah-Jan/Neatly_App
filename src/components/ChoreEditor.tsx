import clsx from 'clsx';
import { Pause, Play, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { relativePast, todayISO, type Frequency, type Unit } from '../domain';
import { useData } from '../store/data';
import { useUI } from '../store/ui';
import { Button, Sheet } from './ui';

const FREQ_PRESETS: Array<{ label: string; f: Frequency }> = [
  { label: 'Daily', f: { every: 1, unit: 'day' } },
  { label: 'Every 3 days', f: { every: 3, unit: 'day' } },
  { label: 'Weekly', f: { every: 1, unit: 'week' } },
  { label: 'Every 2 weeks', f: { every: 2, unit: 'week' } },
  { label: 'Monthly', f: { every: 1, unit: 'month' } },
  { label: 'Every 3 months', f: { every: 3, unit: 'month' } },
];
const MINUTE_PRESETS = [2, 5, 10, 15, 30, 60];
const NEW_SPACE = '__new__';

interface Form {
  title: string;
  spaceId: string;
  newSpace: string;
  every: number;
  unit: Unit;
  minutes: number;
  dueDate: string;
  assigneeId: string;
  notes: string;
}

/** Global add/edit chore dialog, opened via useUI().openEditor. */
export function ChoreEditor() {
  const editor = useUI((s) => s.editor);
  const close = useUI((s) => s.openEditor);
  const toast = useUI((s) => s.toast);
  const spaces = useData((s) => s.spaces);
  const members = useData((s) => s.members);
  const chores = useData((s) => s.chores);
  const { addChore, updateChore, deleteChore, addSpace, setPaused } = useData.getState();

  const editing = editor?.mode === 'edit' ? chores.find((c) => c.id === editor.id) : undefined;
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (!editor) return setForm(null);
    if (editing) {
      setForm({
        title: editing.title,
        spaceId: editing.spaceId,
        newSpace: '',
        every: editing.frequency.every,
        unit: editing.frequency.unit,
        minutes: editing.minutes,
        dueDate: editing.dueDate,
        assigneeId: editing.assigneeId ?? '',
        notes: editing.notes,
      });
    } else {
      const preset = editor.mode === 'new' ? editor.spaceId : undefined;
      setForm({
        title: '',
        spaceId: preset ?? spaces[0]?.id ?? NEW_SPACE,
        newSpace: '',
        every: 1,
        unit: 'week',
        minutes: 10,
        dueDate: todayISO(),
        assigneeId: '',
        notes: '',
      });
    }
    // Only re-initialise when the dialog target changes.
  }, [editor?.mode, editor && 'id' in editor ? editor.id : null]);

  if (!editor || !form) return null;
  const onClose = () => close(null);
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch });

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.title.trim()) return setError('Give the chore a name.');
    if (form.spaceId === NEW_SPACE && !form.newSpace.trim()) return setError('Name the new space.');
    const every = Math.max(1, Math.min(365, Math.floor(form.every) || 1));
    const minutes = Math.max(1, Math.min(600, Math.round(form.minutes) || 5));
    const spaceId = form.spaceId === NEW_SPACE ? addSpace(form.newSpace, '🧹') : form.spaceId;
    const input = {
      title: form.title,
      spaceId,
      frequency: { every, unit: form.unit },
      minutes,
      dueDate: form.dueDate || todayISO(),
      assigneeId: form.assigneeId || null,
      notes: form.notes.trim(),
    };
    if (editing) {
      updateChore(editing.id, input);
      toast('Chore updated');
    } else {
      addChore(input);
      toast(`Added “${input.title.trim()}”`);
    }
    onClose();
  };

  const freqMatches = (f: Frequency) => f.every === form.every && f.unit === form.unit;

  return (
    <Sheet
      open
      onClose={onClose}
      title={editing ? 'Edit chore' : 'New chore'}
      footer={
        <>
          {editing && (
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm(`Delete “${editing.title}”? Its history stays in your stats.`)) {
                  deleteChore(editing.id);
                  toast('Chore deleted');
                  onClose();
                }
              }}
              aria-label="Delete chore"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => submit()}>{editing ? 'Save' : 'Add chore'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label" htmlFor="chore-title">
            What needs doing?
          </label>
          <input
            id="chore-title"
            className="input text-base"
            placeholder="e.g. Vacuum the stairs"
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            maxLength={80}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="label" htmlFor="chore-space">
            Where
          </label>
          <select id="chore-space" className="input" value={form.spaceId} onChange={(e) => set({ spaceId: e.target.value })}>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </option>
            ))}
            <option value={NEW_SPACE}>＋ New space…</option>
          </select>
          {form.spaceId === NEW_SPACE && (
            <input
              className="input mt-2"
              placeholder="Space name, e.g. Garage"
              value={form.newSpace}
              onChange={(e) => set({ newSpace: e.target.value })}
              maxLength={40}
              aria-label="New space name"
            />
          )}
        </div>

        <fieldset>
          <legend className="label">How often</legend>
          <div className="mb-2 flex flex-wrap gap-2">
            {FREQ_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={clsx('chip', freqMatches(p.f) && 'chip-on')}
                onClick={() => set({ every: p.f.every, unit: p.f.unit })}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            Every
            <input
              type="number"
              min={1}
              max={365}
              className="input w-20"
              value={form.every}
              onChange={(e) => set({ every: Number(e.target.value) })}
              aria-label="Repeat every"
            />
            <select className="input w-32" value={form.unit} onChange={(e) => set({ unit: e.target.value as Unit })} aria-label="Repeat unit">
              <option value="day">day(s)</option>
              <option value="week">week(s)</option>
              <option value="month">month(s)</option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Takes about</legend>
          <div className="flex flex-wrap gap-2">
            {MINUTE_PRESETS.map((m) => (
              <button key={m} type="button" className={clsx('chip', form.minutes === m && 'chip-on')} onClick={() => set({ minutes: m })}>
                {m} min
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={600}
              className="input w-24"
              value={form.minutes}
              onChange={(e) => set({ minutes: Number(e.target.value) })}
              aria-label="Minutes"
            />
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="chore-due">
              {editing ? 'Next due' : 'First due'}
            </label>
            <input id="chore-due" type="date" className="input" value={form.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
          </div>
          {members.length > 0 && (
            <div>
              <label className="label" htmlFor="chore-assignee">
                Who usually does it
              </label>
              <select id="chore-assignee" className="input" value={form.assigneeId} onChange={(e) => set({ assigneeId: e.target.value })}>
                <option value="">Anyone</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="label" htmlFor="chore-notes">
            Notes
          </label>
          <textarea
            id="chore-notes"
            className="input min-h-[72px]"
            placeholder="Products to use, tips, what “done” looks like…"
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
            maxLength={500}
          />
        </div>

        {editing && (
          <div className="flex items-center justify-between rounded-xl bg-raised px-4 py-3 text-sm">
            <span className="text-muted">{relativePast(editing.lastDone, todayISO())}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPaused(editing.id, !editing.paused);
                toast(editing.paused ? 'Chore resumed' : 'Chore paused — it won’t show up as due');
              }}
            >
              {editing.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {editing.paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-bad" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="hidden" />
      </form>
    </Sheet>
  );
}
