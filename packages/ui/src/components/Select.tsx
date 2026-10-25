/**
 * Select — dropdown select with states.
 */

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Select({
  label,
  error,
  helper,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || React.useId();
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-xl border border-glass-border bg-glass-surface px-4 py-2 text-sm text-foreground appearance-none',
            'focus-visible:outline-2 focus-visible:outline-liquid-blue focus-visible:ring-1 focus-visible:ring-liquid-blue',
            'disabled:opacity-50 disabled:pointer-events-none',
            error && 'border-error focus-visible:outline-error',
            'pr-10 transition-colors duration-release ease-[var(--motion-easing)]',
            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error || helper ? `${inputId}-message` : undefined}
          {...props}
        />
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error || helper && (
        <p
          id={`${inputId}-message`}
          className={cn(
            'text-xs',
            error ? 'text-error' : 'text-foreground-muted',
          )}
          role={error ? 'alert' : undefined}
        >
          {error || helper}
        </p>
      )}
    </div>
  );
}
