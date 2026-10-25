/**
 * Checkbox — morphs into a check when checked.
 */

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Checkbox({
  label,
  error,
  className,
  id,
  ...props
}: CheckboxProps) {
  const inputId = id || React.useId();
  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          'relative w-5 h-5 rounded-lg border border-glass-border bg-glass-surface',
          'checked:bg-liquid-blue checked:border-liquid-blue',
          'focus-visible:outline-2 focus-visible:outline-liquid-blue',
          'disabled:opacity-50 disabled:pointer-events-none',
          error && 'border-error',
          'transition-colors duration-release ease-[var(--motion-easing)]',
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {props.checked && (
        <span className="absolute flex items-center justify-center w-5 h-5 text-inverse">
          <Check className="w-3 h-3" />
        </span>
      )}
      {label && (
        <span className="text-sm text-foreground-secondary">{label}</span>
      )}
    </label>
  );
}
