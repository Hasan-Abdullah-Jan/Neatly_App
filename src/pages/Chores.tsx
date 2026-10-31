import clsx from 'clsx';
import { ListChecks, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ChoreRow } from '../components/ChoreRow';
import { Button, EmptyState, PageHeader } from '../components/ui';
import { useToday } from '../hooks';
import { useData } from '../store/data';
import { useUI } from '../store/ui';

export function Chores() {
  const today = useToday();
  const chores = useData((s) => s.chores);
  const spaces = useData((s) => s.spaces);
  const members = useData((s) => s.members);
  const openEditor = useUI((s) => s.openEditor);
  const [query, setQuery] = useState('');
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string>('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = chores
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q))
      .filter((c) => !spaceId || c.spaceId === spaceId)
      .filter((c) => !memberId || (memberId === 'none' ? c.assigneeId === null : c.assigneeId === memberId))
      .sort((a, b) => Number(a.paused) - Number(b.paused) || a.dueDate.localeCompare(b.dueDate));
    return spaces
      .map((s) => ({ space: s, items: list.filter((c) => c.spaceId === s.id) }))
      .filter((g) => g.items.length > 0);
  }, [chores, spaces, query, spaceId, memberId]);

  const totalMinutesPerWeek = useMemo(
    () =>
      Math.round(
        chores
          .filter((c) => !c.paused)
          .reduce((acc, c) => {
            const perWeek = c.frequency.unit === 'day' ? 7 / c.frequency.every : c.frequency.unit === 'week' ? 1 / c.frequency.every : 7 / (30 * c.frequency.every);
            return acc + c.minutes * perWeek;
          }, 0),
      ),
    [chores],
  );

  return (
    <>
      <PageHeader
        title="Chores"
        subtitle={
          chores.length > 0
            ? `${chores.length} chores · roughly ${Math.floor(totalMinutesPerWeek / 60)}h ${totalMinutesPerWeek % 60}m of work per week`
            : undefined
        }
        action={
          <Button className="hidden lg:inline-flex" onClick={() => openEditor({ mode: 'new', spaceId: spaceId ?? undefined })}>
            <Plus className="h-4 w-4" /> New
          </Button>
        }
      />

      {chores.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ListChecks />} title="No chores yet">
            <p className="mb-4">Add your first chore, or pick ready-made ones from a space.</p>
            <Button onClick={() => openEditor({ mode: 'new' })}>
              <Plus className="h-4 w-4" /> Add a chore
            </Button>
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="mb-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="input pl-9"
                placeholder="Search chores"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search chores"
              />
            </div>
            {members.length > 0 && (
              <select className="input w-36" value={memberId} onChange={(e) => setMemberId(e.target.value)} aria-label="Filter by person">
                <option value="">Everyone</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value="none">Unassigned</option>
              </select>
            )}
          </div>
          <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <button type="button" className={clsx('chip', !spaceId && 'chip-on')} onClick={() => setSpaceId(null)}>
              All spaces
            </button>
            {spaces.map((s) => (
              <button key={s.id} type="button" className={clsx('chip', spaceId === s.id && 'chip-on')} onClick={() => setSpaceId(spaceId === s.id ? null : s.id)}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {groups.length === 0 && <p className="py-10 text-center text-sm text-muted">No chores match those filters.</p>}
          {groups.map(({ space, items }) => (
            <section key={space.id} className="mb-6">
              <h2 className="mb-2 px-1 text-sm font-semibold">
                {space.emoji} {space.name} <span className="font-normal text-muted">· {items.length}</span>
              </h2>
              <ul className="card p-1.5">
                {items.map((c) => (
                  <ChoreRow key={c.id} chore={c} today={today} showSpace={false} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  );
}
