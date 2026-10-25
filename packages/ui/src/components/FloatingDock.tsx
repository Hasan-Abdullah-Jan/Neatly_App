/**
 * FloatingDock — pill-shaped navigation dock: Home · Tasks · Workspace · Schedule · Profile.
 * Gliding active indicator. Safe-area aware on phones.
 */

import * as React from 'react';
import { cn } from '../lib/cn';
import {
  Home,
  CheckSquare,
  Layout,
  Calendar,
  User,
} from 'lucide-react';

const DOCK_ITEMS: Array<{
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
}> = [
  { key: 'home', label: 'Home', icon: Home, href: '/' },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { key: 'workspace', label: 'Workspace', icon: Layout, href: '/workspace' },
  { key: 'schedule', label: 'Schedule', icon: Calendar, href: '/schedule' },
  { key: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

interface FloatingDockProps {
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function FloatingDock({
  activeKey,
  onSelect,
  className,
}: FloatingDockProps) {
  return (
    <nav
      className={cn(
        'relative inline-flex items-center gap-1 rounded-full bg-glass-deep border border-glass-border px-2 py-1.5 shadow-2 backdrop-blur-lg',
        'data-[glass=lite]:backdrop-blur-none data-[glass=lite]:bg-glass-surface/90',
        'data-[glass=solid]:backdrop-blur-none data-[glass=solid]:bg-glass-surface',
        className,
      )}
      aria-label="Main navigation"
    >
      {DOCK_ITEMS.map((item) => {
        const active = activeKey === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            aria-pressed={active}
            aria-label={item.label}
            className={cn(
              'relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-release ease-[var(--motion-easing)]',
              active
                ? 'bg-liquid-blue text-inverse shadow-[0_0_0_4px_var(--color-liquid-blue)]/20'
                : 'text-foreground-muted hover:bg-glass-surface/50 hover:text-foreground',
              'active:scale-90',
            )}
          >
            <item.icon className="w-5 h-5" />
            {active && (
              <span className="sr-only">Active: {item.label}</span>
            )}
          </button>
        );
      })}
      {/* Safe-area bottom padding for phones */}
      <div className="h-4 pb-2" />
    </nav>
  );
}
