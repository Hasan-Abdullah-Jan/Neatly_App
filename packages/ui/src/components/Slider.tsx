/**
 * Slider — range slider.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({
  label,
  error,
  min = 0,
  max = 100,
  step = 1,
  className,
  id,
  ...props
}: SliderProps) {
  const inputId = id || React.useId();
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        className={cn(
          'w-full h-2 bg-glass-border rounded-lg appearance-none cursor-pointer accent-liquid-blue',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-liquid-blue',
          'disabled:opacity-50 disabled:pointer-events-none',
          error && 'border-error',
          className,
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
