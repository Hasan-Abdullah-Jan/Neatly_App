/**
 * ProgressRing — circular progress indicator.
 */

import { cn } from '../lib/cn';

interface ProgressRingProps {
  value: number; // 0–100
  max?: number;
  size?: 'sm' | 'base' | 'lg';
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'w-12 h-12',
  base: 'w-20 h-20',
  lg: 'w-28 h-28',
};

export function ProgressRing({
  value,
  max = 100,
  size = 'base',
  label,
  className,
}: ProgressRingProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDasharray = 283; // circumference of r=45 circle
  const strokeDashoffset = strokeDasharray - (percent / 100) * strokeDasharray;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeStyles[size],
        className,
      )}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
        aria-label={label}
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--color-glass-border)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--color-liquid-blue)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-release ease-[var(--motion-easing)]"
        />
      </svg>
      {label && (
        <span className="absolute text-xs font-medium text-foreground tabular-nums">
          {label}
        </span>
      )}
    </div>
  );
}
