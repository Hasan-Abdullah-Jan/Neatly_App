/**
 * ListRow — a row in a list with optional leading avatar, trailing controls, and swipe actions.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface ListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  swipeActions?: React.ReactNode;
  disabled?: boolean;
}

export function ListRow({
  leading,
  trailing,
  swipeActions,
  disabled,
  className,
  children,
  ...props
}: ListRowProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? undefined : 0}
      aria-disabled={disabled || undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-xl border border-glass-border/50 bg-glass-surface px-4 py-3',
        'transition-colors duration-release ease-[var(--motion-easing)]',
        'hover:bg-glass-deep',
        'focus-visible:outline-2 focus-visible:outline-liquid-blue',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      {...props}
    >
      {swipeActions && (
        <div className="absolute inset-y-0 left-0 -right-full flex items-center px-4">
          {swipeActions}
        </div>
      )}
      {leading && <span className="shrink-0">{leading}</span>}
      <div className="flex-1 min-w-0">{children}</div>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </div>
  );
}
