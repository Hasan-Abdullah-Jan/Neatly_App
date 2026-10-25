/**
 * Textarea — multi-line text input with states.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  rows?: number;
}

export function Textarea({
  label,
  error,
  helper,
  rows = 4,
  className,
  id,
  ...props
}: TextareaProps) {
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
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'min-h-[100px] w-full rounded-xl border border-glass-border bg-glass-surface px-4 py-2 text-sm text-foreground',
          'placeholder:text-foreground-muted/60',
          'focus-visible:outline-2 focus-visible:outline-liquid-blue focus-visible:ring-1 focus-visible:ring-liquid-blue',
          'disabled:opacity-50 disabled:pointer-events-none',
          error && 'border-error focus-visible:outline-error',
          'transition-colors duration-release ease-[var(--motion-easing)]',
          className,
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error || helper ? `${inputId}-message` : undefined}
        {...props}
      />
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
