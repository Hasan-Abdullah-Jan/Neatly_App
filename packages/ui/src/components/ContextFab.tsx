/**
 * ContextFab — the contextual action button (Add · Capture · Report · Finish).
 * A pill-shaped FAB that sits near the dock.
 */

import * as React from 'react';
import { Plus, Smartphone, Flag, CheckCircle } from 'lucide-react';
import { cn } from '../lib/cn';

const FAB_ACTIONS: Record<string, { label: string; icon: React.ElementType }> = {
  add: { label: 'Add', icon: Plus },
  capture: { label: 'Capture', icon: Smartphone },
  report: { label: 'Report', icon: Flag },
  finish: { label: 'Finish', icon: CheckCircle },
};

interface ContextFabProps {
  action?: keyof typeof FAB_ACTIONS;
  onAction?: () => void;
  className?: string;
}

export function ContextFab({
  action = 'add',
  onAction,
  className,
}: ContextFabProps) {
  const { label, icon: Icon } = FAB_ACTIONS[action];

  return (
    <button
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full bg-liquid-blue text-inverse px-3 py-2 text-sm font-medium shadow-2',
        'hover:bg-liquid-blue-dim active:scale-95',
        'transition-colors duration-release ease-[var(--motion-easing)]',
        className,
      )}
      onClick={onAction}
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
