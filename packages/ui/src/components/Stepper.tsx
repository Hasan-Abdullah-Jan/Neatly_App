/**
 * Stepper — numeric stepper.
 */

import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/cn';

interface StepperProps {
  value: number;
  onChange: (updater: (prev: number) => number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  error?: string;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  error,
  className,
}: StepperProps) {
  const decrement = () =>
    onChange((v) => (min !== undefined && v <= min ? v : v - step));
  const increment = () =>
    onChange((v) => (max !== undefined && v >= max ? v : v + step));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && (
        <span className="text-sm font-medium text-foreground-secondary">
          {label}
        </span>
      )}
      <button
        onClick={decrement}
        disabled={min !== undefined && value <= min}
        aria-label="Decrease"
        className="w-8 h-8 rounded-lg border border-glass-border bg-glass-surface text-foreground-secondary hover:bg-glass-deep disabled:opacity-50 disabled:pointer-events-none"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-12 text-right tabular-nums font-medium text-foreground">
        {value}
      </span>
      <button
        onClick={increment}
        disabled={max !== undefined && value >= max}
        aria-label="Increase"
        className="w-8 h-8 rounded-lg border border-glass-border bg-glass-surface text-foreground-secondary hover:bg-glass-deep disabled:opacity-50 disabled:pointer-events-none"
      >
        <Plus className="w-4 h-4" />
      </button>
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
