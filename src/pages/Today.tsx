import clsx from 'clsx';
import { Flame, PartyPopper, Timer, TrendingUp, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChoreRow, useCompleteChore } from '../components/ChoreRow';
import { Button, FreshnessBar, MemberDot, PageHeader, ProgressRing, Segmented } from '../components/ui';
import { dueNow, freshness, quickPlan, streak, upcoming, weekdayName, weekStats, shortDate, type Chore } from '../domain';
import { useToday } from '../hooks';
import { useData } from '../store/data';

const BUDGETS = [5, 15, 30, 60];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Today() {
  const today = useToday();
  const chores = useData((s) => s.chores);
  const completions = useData((s) => s.completions);
  const members = useData((s) => s.members);
  const currentMemberId = useData((s) => s.currentMemberId);
  const me = members.find((m) => m.id === currentMemberId);
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [budget, setBudget] = useState<number | null>(null);
  const completeChore = useCompleteChore();

  const visible = useMemo(
    () => (scope === 'mine' && me ? chores.filter((c) => c.assigneeId === me.id || c.assigneeId === null) : chores),
    [chores, scope, me],
  );
  const due = dueNow(visible, today);
  const overdue = due.filter((c) => c.dueDate < today);
  const dueToday = due.filter((c) => c.dueDate === today);
  const soon = upcoming(visible, today, 3);
  const doneToday = completions.filter((c) => c.date === today);
  const total = doneToday.length + due.length;
  const pct = total === 0 ? 100 : Math.round((doneToday.length / total) * 100);
  const homeFresh = freshness(chores, today);
  const week = weekStats(completions, today);
  const days = streak(completions, today);
  const plan = budget ? quickPlan(visible, budget, today) : null;
  const minutesLeft = due.reduce((a, c) => a + c.minutes, 0);

  const dateLabel = `${weekdayName(today)}, ${shortDate(today)}`;
  const firstName = me?.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
        subtitle={dateLabel}
        action={
          me && members.length > 1 ? (
            <Segmented
              label="Show chores for"
              value={scope}
              onChange={setScope}
              options={[
                { value: 'all', label: 'Everyone' },
                { value: 'mine', label: 'Mine' },
              ]}
            />
          ) : undefined
        }
      />

      {/* Summary */}
      <section className="card mb-4 flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
        <ProgressRing value={pct} size={92}>
          <span className="text-2xl font-bold tabular-nums">
            {doneToday.length}/{total}
          </span>
          <span className="text-[11px] text-muted">today</span>
        </ProgressRing>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm text-fg-2">
            {due.length === 0
              ? doneToday.length > 0
                ? 'Everything due today is done. Nice work!'
                : 'Nothing due today. Enjoy the clean space.'
              : `${due.length} ${due.length === 1 ? 'chore' : 'chores'} left · about ${minutesLeft} min`}
          </p>
          {homeFresh !== null && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Home freshness</span>
                <span className="font-medium text-fg">{homeFresh}%</span>
              </div>
              <FreshnessBar value={homeFresh} />
            </div>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 text-fg-2">
              <Flame className={clsx('h-4 w-4', days > 0 ? 'text-warn' : 'text-muted')} />
              {days}-day streak
            </span>
            <span className="inline-flex items-center gap-1.5 text-fg-2">
              <TrendingUp className="h-4 w-4 text-ok" />
              {week.count} done this week
            </span>
            <span className="inline-flex items-center gap-1.5 text-fg-2">
              <Timer className="h-4 w-4 text-brand" />
              {week.minutes} min this week
            </span>
          </div>
        </div>
      </section>

      {/* Quick plan */}
      <section className="card mb-6 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Zap className="h-5 w-5 text-brand" />
          <h2 className="mr-auto font-semibold">Got a few minutes?</h2>
          <div className="flex gap-2">
            {BUDGETS.map((b) => (
              <button key={b} type="button" className={clsx('chip', budget === b && 'chip-on')} onClick={() => setBudget(budget === b ? null : b)}>
                {b < 60 ? `${b} min` : '1 hour'}
              </button>
            ))}
          </div>
        </div>
        {plan && (
          <div className="mt-4">
            {plan.items.length === 0 ? (
              <p className="text-sm text-muted">Nothing fits in {budget} minutes right now — you're in good shape.</p>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted">
                  {plan.items.length} {plan.items.length === 1 ? 'chore' : 'chores'} · {plan.minutes} min
                  {plan.includesAhead && ' · includes a few to get ahead'}
                </p>
                <ul className="-mx-3">
                  {plan.items.map((c) => (
                    <ChoreRow key={c.id} chore={c} today={today} />
                  ))}
                </ul>
                {plan.items.length > 1 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      plan.items.forEach((c: Chore) => completeChore(c));
                      setBudget(null);
                    }}
                  >
                    Mark all {plan.items.length} done
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {chores.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="mb-4 text-muted">You don't have any chores yet.</p>
          <Link to="/spaces" className="font-medium text-brand">
            Add a space and pick some chores →
          </Link>
        </div>
      ) : (
        <>
          <Section title="Overdue" tone="bad" items={overdue} today={today} />
          <Section title="Today" items={dueToday} today={today} />
          {due.length === 0 && (
            <div className="card mb-6 flex items-center gap-4 p-5">
              <PartyPopper className="h-8 w-8 shrink-0 text-brand" />
              <div className="text-sm">
                <div className="font-semibold">All caught up</div>
                <div className="text-muted">
                  {soon[0]
                    ? `Next up: ${soon[0].title} (${weekdayName(soon[0].dueDate)}). You can get ahead below.`
                    : 'Nothing else in the next few days.'}
                </div>
              </div>
            </div>
          )}
          <Section title="Coming up" subtitle="Next 3 days" items={soon} today={today} muted limit={5} />
          {doneToday.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 px-1 text-sm font-semibold text-muted">Done today · {doneToday.length}</h2>
              <ul className="card divide-y divide-line">
                {doneToday.map((c) => {
                  const who = members.find((m) => m.id === c.memberId);
                  const time = new Date(c.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="text-ok">✓</span>
                      <span className="flex-1 truncate text-fg-2">{c.title}</span>
                      {who && <MemberDot name={who.name} color={who.color} />}
                      <span className="text-xs text-muted">{time}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {members.length > 1 && week.count > 0 && <WhoDidWhat week={week.byMember} />}
        </>
      )}
    </>
  );
}

function Section({
  title,
  subtitle,
  items,
  today,
  tone,
  muted,
  limit,
}: {
  title: string;
  subtitle?: string;
  items: Chore[];
  today: string;
  tone?: 'bad';
  muted?: boolean;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  const shown = limit && !expanded ? items.slice(0, limit) : items;
  return (
    <section className="mb-6">
      <h2 className={clsx('mb-2 flex items-baseline gap-2 px-1 text-sm font-semibold', tone === 'bad' ? 'text-bad' : muted ? 'text-muted' : 'text-fg')}>
        {title} · {items.length}
        {subtitle && <span className="text-xs font-normal text-muted">{subtitle}</span>}
      </h2>
      <ul className="card p-1.5">
        {shown.map((c) => (
          <ChoreRow key={c.id} chore={c} today={today} />
        ))}
        {shown.length < items.length && (
          <li>
            <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-brand hover:bg-raised" onClick={() => setExpanded(true)}>
              Show {items.length - shown.length} more
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}

function WhoDidWhat({ week }: { week: Map<string | null, { count: number; minutes: number }> }) {
  const members = useData((s) => s.members);
  const rows = members.map((m) => ({ m, ...(week.get(m.id) ?? { count: 0, minutes: 0 }) }));
  const max = Math.max(1, ...rows.map((r) => r.minutes));
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-sm font-semibold text-muted">Who did what · last 7 days</h2>
      <div className="card space-y-3 p-4">
        {rows.map(({ m, count, minutes }) => (
          <div key={m.id} className="flex items-center gap-3 text-sm">
            <MemberDot name={m.name} color={m.color} size="md" />
            <div className="flex-1">
              <div className="mb-1 flex justify-between">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted">
                  {count} chores · {minutes} min
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full" style={{ width: `${(minutes / max) * 100}%`, background: m.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
