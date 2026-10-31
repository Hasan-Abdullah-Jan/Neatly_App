import clsx from 'clsx';
import { CalendarDays, Home, LayoutGrid, ListChecks, Plus, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useUI } from '../store/ui';

const NAV = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/chores', label: 'Chores', icon: ListChecks },
  { to: '/spaces', label: 'Spaces', icon: LayoutGrid },
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const openEditor = useUI((s) => s.openEditor);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">Neatly</span>
        </div>
        <button
          type="button"
          onClick={() => openEditor({ mode: 'new' })}
          className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-fg transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New chore
        </button>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive ? 'bg-brand/10 text-brand' : 'text-fg-2 hover:bg-raised',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs text-muted">Your data stays on this device.</p>
      </aside>

      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6 sm:px-6 lg:pb-12 lg:pt-10">{children}</main>

      {/* Mobile: floating add button + bottom tab bar */}
      <button
        type="button"
        onClick={() => openEditor({ mode: 'new' })}
        aria-label="New chore"
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-xl transition active:scale-95 lg:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
      <nav
        aria-label="Main"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur-lg lg:hidden"
      >
        <div className="mx-auto flex max-w-lg justify-around px-2 pt-1.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium transition',
                  isActive ? 'text-brand' : 'text-muted',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
