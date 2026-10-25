/**
 * Chip — small pill label.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'filled';
  onSelect?: () => void;
  selected?: boolean;
}

export function Chip({
  variant = 'default',
  onSelect,
  selected,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-release ease-[var(--motion-easing)]',
        variant === 'filled'
          ? 'bg-liquid-blue text-inverse border-transparent'
          : variant === 'outline'
            ? 'border-glass-border text-foreground-secondary hover:border-liquid-blue'
            : 'text-foreground-muted',
        selected && 'bg-liquid-blue/20 text-liquid-blue border-liquid-blue/40',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
