import clsx from 'clsx';
import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ChoreRow } from '../components/ChoreRow';
import { EmptyState, PageHeader, Segmented } from '../components/ui';
import { agenda, diffDays, shortDate, weekdayName } from '../domain';
import { useToday } from '../hooks';
import { useData } from '../store/data';

export function Plan() {
  const today = useToday();
  const chores = useData((s) => s.chores);
  const [range, setRange] = useState<'7' | '14'>('7');
  const days = useMemo(() => agenda(chores, today, Number(range)), [chores, today, range]);
  const maxMinutes = Math.max(30, ...days.map((d) => d.minutes));
  const total = days.reduce((a, d) => a + d.minutes, 0);

  return (
    <>
      <PageHeader
        title="Plan"
        subtitle={chores.length ? `About ${Math.round(total / Number(range))} min a day on average` : undefined}
        action={
          <Segmented
            label="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: 'Week' },
              { value: '14', label: '2 weeks' },
            ]}
          />
        }
      />
      {chores.length === 0 ? (
        <div className="card">
          <EmptyState icon={<CalendarDays />} title="Nothing to plan yet">
            Add chores and they'll be laid out across the coming days.
          </EmptyState>
        </div>
      ) : (
        <>
          {/* Load overview: spot heavy days at a glance */}
          <div className="card mb-6 p-4">
            <div className="flex items-end gap-1.5">
              {days.map((d) => {
                const isToday = d.date === today;
                return (
                  <a key={d.date} href={`#day-${d.date}`} className="group flex flex-1 flex-col items-center gap-1" title={`${d.minutes} min`}>
                    <div className="flex h-20 w-full items-end">
                      <div
                        className={clsx('w-full rounded-md transition group-hover:opacity-80', isToday ? 'bg-brand' : 'bg-brand/35')}
                        style={{ height: `${Math.max(4, (d.minutes / maxMinutes) * 100)}%` }}
                      />
                    </div>
                    <span className={clsx('text-[10px]', isToday ? 'font-semibold text-brand' : 'text-muted')}>
                      {range === '7' ? weekdayName(d.date, true) : weekdayName(d.date, true).charAt(0)}
                    </span>
                  </a>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">
              Minutes of chores per day. Heavy day? Open a chore and move its due date to spread the load.
            </p>
          </div>

          {days.map((d) => {
            const offset = diffDays(today, d.date);
            const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : weekdayName(d.date);
            return (
              <section key={d.date} id={`day-${d.date}`} className="mb-5 scroll-mt-4">
                <h2 className="mb-2 flex items-baseline justify-between px-1 text-sm">
                  <span className="font-semibold">
                    {label} <span className="font-normal text-muted">· {shortDate(d.date)}</span>
                  </span>
                  <span className="text-xs text-muted">{d.items.length ? `${d.items.length} · ${d.minutes} min` : 'Free day'}</span>
                </h2>
                {d.items.length > 0 && (
                  <ul className="card p-1.5">
                    {d.items.map(({ chore, overdue }) => (
                      <ChoreRow
                        key={chore.id + d.date}
                        chore={chore}
                        today={today}
                        canComplete={offset === 0}
                        dueLabel={overdue ? 'Overdue' : offset === 0 ? 'Today' : chore.dueDate !== d.date ? 'Repeat' : null}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
