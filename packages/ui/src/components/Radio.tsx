/**
 * Radio — radio button group item.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  error?: string;
}

export function Radio({
  label,
  value,
  checked = false,
  onChange,
  error,
  className,
}: RadioProps) {
  const inputId = `radio-${value}`;
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
        type="radio"
        name="radio-group"
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        className={cn(
          'w-5 h-5 rounded-full border-2 border-glass-border text-liquid-blue',
          'checked:border-liquid-blue checked:bg-liquid-blue',
          'focus-visible:outline-2 focus-visible:outline-liquid-blue',
          'disabled:opacity-50 disabled:pointer-events-none',
          error && 'border-error',
          'transition-colors duration-release ease-[var(--motion-easing)]',
        )}
        aria-invalid={error ? 'true' : 'false'}
      />
      <span className="text-sm text-foreground-secondary">{label}</span>
    </label>
  );
}
