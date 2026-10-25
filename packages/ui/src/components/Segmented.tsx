/**
 * Segmented — segmented control (pill-shaped).
 */

import { cn } from '../lib/cn';

interface SegmentedProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export function Segmented({
  value,
  onValueChange,
  options,
  className,
}: SegmentedProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-glass-border p-1 bg-glass-surface/50',
        className,
      )}
      role="radiogroup"
      aria-label="Segmented control"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onValueChange(option.value)}
            role="radio"
            aria-checked={active}
            className={cn(
              'relative flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-liquid-blue text-inverse shadow-sm'
                : 'text-foreground-muted hover:bg-glass-surface/50 hover:text-foreground',
              'active:scale-95',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
