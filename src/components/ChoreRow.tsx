import clsx from 'clsx';
import { Check, Clock, Pause } from 'lucide-react';
import { useState } from 'react';
import { describeFrequency, dueStatus, relativeDue, type Chore } from '../domain';
import { useData } from '../store/data';
import { useUI } from '../store/ui';
import { MemberDot } from './ui';

/** Mark a chore done with an Undo toast. Shared by every list in the app. */
export function useCompleteChore() {
  const complete = useData((s) => s.completeChore);
  const undo = useData((s) => s.undoCompletion);
  const toast = useUI((s) => s.toast);
  return (chore: Chore) => {
    const id = complete(chore.id);
    if (id) toast(`“${chore.title}” done`, { label: 'Undo', run: () => undo(id) });
  };
}

export function ChoreRow({
  chore,
  today,
  showSpace = true,
  canComplete = true,
  dueLabel,
}: {
  chore: Chore;
  today: string;
  showSpace?: boolean;
  canComplete?: boolean;
  /** Override the due label (e.g. in the agenda, where the date is the header). */
  dueLabel?: string | null;
}) {
  const space = useData((s) => s.spaces.find((sp) => sp.id === chore.spaceId));
  const assignee = useData((s) => s.members.find((m) => m.id === chore.assigneeId));
  const snooze = useData((s) => s.snoozeChore);
  const openEditor = useUI((s) => s.openEditor);
  const toast = useUI((s) => s.toast);
  const completeChore = useCompleteChore();
  const [ticking, setTicking] = useState(false);

  const status = dueStatus(chore, today);
  const label = dueLabel === undefined ? relativeDue(chore.dueDate, today) : dueLabel;

  const onComplete = () => {
    if (ticking) return;
    setTicking(true);
    window.setTimeout(() => {
      completeChore(chore);
      setTicking(false);
    }, 320);
  };

  return (
    <li
      className={clsx(
        'group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition',
        ticking ? 'opacity-60' : 'hover:bg-raised',
      )}
    >
      {canComplete ? (
        <button
          type="button"
          onClick={onComplete}
          aria-label={`Mark “${chore.title}” done`}
          className={clsx(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition',
            ticking ? 'animate-pop border-ok bg-ok text-white' : 'border-line text-transparent hover:border-ok hover:text-ok',
          )}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </button>
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center text-lg" aria-hidden="true">
          {space?.emoji ?? '•'}
        </span>
      )}

      <button
        type="button"
        onClick={() => openEditor({ mode: 'edit', id: chore.id })}
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit “${chore.title}”`}
      >
        <div className={clsx('truncate text-[15px] font-medium', ticking && 'line-through')}>{chore.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
          {showSpace && space && (
            <span>
              {canComplete ? `${space.emoji} ` : ''}
              {space.name}
            </span>
          )}
          <span>{chore.minutes} min</span>
          <span>{describeFrequency(chore.frequency)}</span>
          {assignee && (
            <span className="inline-flex items-center gap-1">
              <MemberDot name={assignee.name} color={assignee.color} />
              {assignee.name}
            </span>
          )}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {chore.paused ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-raised px-2 py-0.5 text-xs text-muted">
            <Pause className="h-3 w-3" /> Paused
          </span>
        ) : (
          label && (
            <span
              className={clsx(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                status === 'overdue' && 'bg-bad/10 text-bad',
                status === 'today' && 'bg-brand/10 text-brand',
                (status === 'soon' || status === 'later') && 'text-muted',
              )}
            >
              {label}
            </span>
          )
        )}
        {canComplete && !chore.paused && chore.dueDate <= today && (
          <button
            type="button"
            onClick={() => {
              snooze(chore.id, 1);
              toast(`“${chore.title}” moved to tomorrow`);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-fg"
            aria-label={`Do “${chore.title}” tomorrow`}
            title="Do it tomorrow"
          >
            <Clock className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}
