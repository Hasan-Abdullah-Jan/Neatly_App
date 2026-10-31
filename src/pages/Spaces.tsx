import clsx from 'clsx';
import { ArrowLeft, LayoutGrid, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChoreRow } from '../components/ChoreRow';
import { Button, EmptyState, FreshnessBar, IconButton, PageHeader, Sheet, freshnessTone } from '../components/ui';
import { EMOJI_CHOICES, dueNow, freshness, templateForName, type Space } from '../domain';
import { useToday } from '../hooks';
import { useData } from '../store/data';
import { useUI } from '../store/ui';

export function Spaces() {
  const today = useToday();
  const spaces = useData((s) => s.spaces);
  const chores = useData((s) => s.chores);
  const [adding, setAdding] = useState(false);

  const rows = spaces
    .map((s) => {
      const own = chores.filter((c) => c.spaceId === s.id);
      return { space: s, total: own.length, due: dueNow(own, today).length, fresh: freshness(own, today) };
    })
    .sort((a, b) => (a.fresh ?? 101) - (b.fresh ?? 101));

  return (
    <>
      <PageHeader
        title="Spaces"
        subtitle="Least fresh first — so you know where to start."
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Space
          </Button>
        }
      />
      {spaces.length === 0 ? (
        <div className="card">
          <EmptyState icon={<LayoutGrid />} title="No spaces yet">
            Spaces are the rooms or areas you look after — a kitchen, an office, a car.
          </EmptyState>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map(({ space, total, due, fresh }) => (
            <li key={space.id}>
              <Link to={`/spaces/${space.id}`} className="card block p-4 transition hover:-translate-y-0.5 hover:border-brand/40">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-raised text-2xl" aria-hidden="true">
                    {space.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{space.name}</div>
                    <div className="text-xs text-muted">
                      {total} {total === 1 ? 'chore' : 'chores'}
                      {due > 0 && <span className="text-bad"> · {due} due</span>}
                    </div>
                  </div>
                  {fresh !== null && (
                    <span
                      className={clsx(
                        'text-lg font-bold tabular-nums',
                        freshnessTone(fresh) === 'ok' && 'text-ok',
                        freshnessTone(fresh) === 'warn' && 'text-warn',
                        freshnessTone(fresh) === 'bad' && 'text-bad',
                      )}
                    >
                      {fresh}%
                    </span>
                  )}
                </div>
                <FreshnessBar value={fresh} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <SpaceSheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

export function SpaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const today = useToday();
  const space = useData((s) => s.spaces.find((sp) => sp.id === id));
  const allChores = useData((s) => s.chores);
  const { deleteSpace, addChoresFromTemplate } = useData.getState();
  const openEditor = useUI((s) => s.openEditor);
  const toast = useUI((s) => s.toast);
  const [editing, setEditing] = useState(false);

  if (!space) {
    return (
      <div className="card">
        <EmptyState icon="🤔" title="Space not found">
          <Link to="/spaces" className="text-brand">
            Back to spaces
          </Link>
        </EmptyState>
      </div>
    );
  }

  const chores = allChores.filter((c) => c.spaceId === space.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const fresh = freshness(chores, today);
  const template = templateForName(space.name);
  const existing = new Set(chores.map((c) => c.title.toLowerCase()));
  const suggestions = template?.chores.filter((c) => !existing.has(c.title.toLowerCase())) ?? [];

  return (
    <>
      <Link to="/spaces" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Spaces
      </Link>
      <PageHeader
        title={`${space.emoji} ${space.name}`}
        subtitle={fresh === null ? 'No chores yet' : `${fresh}% fresh · ${chores.length} chores`}
        action={
          <div className="flex gap-1">
            <IconButton label="Edit space" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Delete space"
              onClick={() => {
                if (window.confirm(`Delete “${space.name}” and its ${chores.length} chores?`)) {
                  deleteSpace(space.id);
                  toast('Space deleted');
                  navigate('/spaces');
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        }
      />
      {fresh !== null && (
        <div className="mb-6">
          <FreshnessBar value={fresh} />
        </div>
      )}

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold">Chores</h2>
          <Button variant="ghost" size="sm" onClick={() => openEditor({ mode: 'new', spaceId: space.id })}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {chores.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">No chores here yet.</div>
        ) : (
          <ul className="card p-1.5">
            {chores.map((c) => (
              <ChoreRow key={c.id} chore={c} today={today} showSpace={false} />
            ))}
          </ul>
        )}
      </section>

      {template && suggestions.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-brand" /> Suggested for a {template.name.toLowerCase()}
            </h2>
            {suggestions.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  addChoresFromTemplate(space.id, template, suggestions.map((s) => s.title));
                  toast(`Added ${suggestions.length} chores`);
                }}
              >
                Add all
              </Button>
            )}
          </div>
          <ul className="card divide-y divide-line">
            {suggestions.map((s) => (
              <li key={s.title} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="flex-1">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted">{s.minutes} min</div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    addChoresFromTemplate(space.id, template, [s.title]);
                    toast(`Added “${s.title}”`);
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <SpaceSheet open={editing} onClose={() => setEditing(false)} space={space} />
    </>
  );
}

function SpaceSheet({ open, onClose, space }: { open: boolean; onClose: () => void; space?: Space }) {
  const { addSpace, updateSpace, addChoresFromTemplate } = useData.getState();
  const toast = useUI((s) => s.toast);
  const navigate = useNavigate();
  const [name, setName] = useState(space?.name ?? '');
  const [emoji, setEmoji] = useState(space?.emoji ?? '🧹');
  const [withSuggestions, setWithSuggestions] = useState(true);
  const template = !space ? templateForName(name) : undefined;

  const reset = () => {
    setName(space?.name ?? '');
    setEmoji(space?.emoji ?? '🧹');
    onClose();
  };

  const save = () => {
    if (!name.trim()) return;
    if (space) {
      updateSpace(space.id, { name: name.trim(), emoji });
      toast('Space updated');
      onClose();
      return;
    }
    const id = addSpace(name, emoji);
    if (template && withSuggestions) addChoresFromTemplate(id, template);
    toast(`Added ${name.trim()}`);
    setName('');
    setEmoji('🧹');
    onClose();
    navigate(`/spaces/${id}`);
  };

  return (
    <Sheet
      open={open}
      onClose={reset}
      title={space ? 'Edit space' : 'New space'}
      footer={
        <>
          <div className="flex-1" />
          <Button variant="secondary" onClick={reset}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim()}>
            {space ? 'Save' : 'Add space'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-5"
      >
        <div>
          <label className="label" htmlFor="space-name">
            Name
          </label>
          <input
            id="space-name"
            className="input text-base"
            placeholder="e.g. Kitchen, Garage, Car"
            value={name}
            maxLength={40}
            onChange={(e) => {
              setName(e.target.value);
              const t = !space && templateForName(e.target.value);
              if (t) setEmoji(t.emoji);
            }}
          />
        </div>
        <fieldset>
          <legend className="label">Icon</legend>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                aria-label={`Icon ${e}`}
                aria-pressed={emoji === e}
                className={clsx('flex aspect-square items-center justify-center rounded-lg text-xl transition', emoji === e ? 'bg-brand/15 ring-2 ring-brand' : 'hover:bg-raised')}
              >
                {e}
              </button>
            ))}
          </div>
        </fieldset>
        {template && (
          <label className="flex items-start gap-3 rounded-xl bg-raised p-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[rgb(var(--brand))]" checked={withSuggestions} onChange={(e) => setWithSuggestions(e.target.checked)} />
            <span>
              Add {template.chores.length} suggested {template.name.toLowerCase()} chores
              <span className="block text-xs text-muted">{template.chores.map((c) => c.title).join(', ')}</span>
            </span>
          </label>
        )}
        <button type="submit" className="hidden" />
      </form>
    </Sheet>
  );
}
