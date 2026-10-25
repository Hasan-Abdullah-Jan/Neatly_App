/**
 * Toggle — on/off switch.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelOn?: string;
  labelOff?: string;
  error?: string;
}

export function Toggle({
  label,
  labelOn,
  labelOff,
  error,
  className,
  id,
  ...props
}: ToggleProps) {
  const inputId = id || React.useId();
  return (
    <label
      className={cn(
        'flex items-center gap-4 cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2',
          'checked:bg-liquid-blue',
          'data-[state=unchecked]:bg-glass-surface data-[state=unchecked]:border-glass-border',
          'disabled:opacity-50 disabled:pointer-events-none',
          error && 'border-error',
          className,
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform"
        data-checked="translate-x-5"
        data-unchecked="translate-x-0"
      />
      {label && (
        <span className="text-sm text-foreground-secondary">
          {label}
        </span>
      )}
    </label>
  );
}
