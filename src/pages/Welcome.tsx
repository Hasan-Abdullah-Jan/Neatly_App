import clsx from 'clsx';
import { Minus, Plus, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { SPACE_TEMPLATES } from '../domain';
import { useData } from '../store/data';
import { useUI } from '../store/ui';
import { Button } from '../components/ui';

const DEFAULT_COUNTS: Record<string, number> = { kitchen: 1, bathroom: 1, bedroom: 1, living: 1, home: 1 };

/** First-run setup: pick rooms → get a ready-made, staggered cleaning routine. */
export function Welcome() {
  const { setupHome, finishOnboarding, importData } = useData.getState();
  const toast = useUI((s) => s.toast);
  const [step, setStep] = useState<'rooms' | 'people'>('rooms');
  const [counts, setCounts] = useState<Record<string, number>>(DEFAULT_COUNTS);
  const [names, setNames] = useState<string[]>(['']);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const choreCount = SPACE_TEMPLATES.reduce((acc, t) => acc + (counts[t.key] ?? 0) * t.chores.length, 0);
  const bump = (key: string, delta: number) =>
    setCounts((c) => ({ ...c, [key]: Math.max(0, Math.min(6, (c[key] ?? 0) + delta)) }));

  const finish = () => {
    const rooms = SPACE_TEMPLATES.flatMap((t) => {
      const n = counts[t.key] ?? 0;
      return Array.from({ length: n }, (_, i) => ({ template: t, name: n > 1 ? `${t.name} ${i + 1}` : t.name }));
    });
    setupHome(rooms, names);
    toast(`You're set! ${choreCount} chores across ${total} spaces.`);
  };

  const onImport = async (file: File) => {
    try {
      importData(JSON.parse(await file.text()));
      toast('Backup restored');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not read that file');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <img src="/favicon.svg" alt="" className="mx-auto mb-4 h-14 w-14" />
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Neatly</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          A calm plan for keeping your place clean. Tell us what your home looks like and we'll build a routine you can
          tweak — no account needed.
        </p>
      </div>

      {step === 'rooms' ? (
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Which spaces do you look after?</h2>
          <p className="mb-5 text-sm text-muted">Each comes with a starter set of chores and sensible frequencies.</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SPACE_TEMPLATES.map((t) => {
              const n = counts[t.key] ?? 0;
              return (
                <li
                  key={t.key}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition',
                    n > 0 ? 'border-brand/50 bg-brand/5' : 'border-line',
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {t.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted">{t.chores.length} chores</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => bump(t.key, -1)}
                      disabled={n === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-raised disabled:opacity-30"
                      aria-label={`Fewer ${t.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold tabular-nums" aria-label={`${n} ${t.name}`}>
                      {n}
                    </span>
                    <button
                      type="button"
                      onClick={() => bump(t.key, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-raised"
                      aria-label={`More ${t.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <button type="button" className="text-sm text-muted hover:text-fg" onClick={finishOnboarding}>
              Start from scratch
            </button>
            <div className="flex-1" />
            <Button onClick={() => setStep('people')} disabled={total === 0}>
              Continue · {total} {total === 1 ? 'space' : 'spaces'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Who shares the chores?</h2>
          <p className="mb-5 text-sm text-muted">
            Optional. Add people to assign chores and see who did what. Skip it if it's just you.
          </p>
          <div className="space-y-2">
            {names.map((n, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input"
                  placeholder={i === 0 ? 'Your name' : 'Name'}
                  value={n}
                  maxLength={30}
                  onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))}
                  aria-label={`Person ${i + 1}`}
                />
                {names.length > 1 && (
                  <button
                    type="button"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-raised"
                    onClick={() => setNames(names.filter((_, j) => j !== i))}
                    aria-label="Remove person"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {names.length < 8 && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setNames([...names, ''])}>
              <Plus className="h-4 w-4" /> Add someone
            </Button>
          )}
          <div className="mt-6 flex items-center gap-3">
            <Button variant="secondary" onClick={() => setStep('rooms')}>
              Back
            </Button>
            <div className="flex-1" />
            <Button onClick={finish}>Create my plan</Button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> Restore from a backup file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
        />
      </div>
    </div>
  );
}
