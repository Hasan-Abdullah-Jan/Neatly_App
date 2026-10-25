/**
 * Sparkline — tiny sparkline chart + chart wrapper base.
 */

import { cn } from '../lib/cn';

interface SparklineProps {
  data: Array<number>;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  height = 40,
  color = 'var(--color-liquid-blue)',
  className,
}: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className={cn('w-full', className)}
      width="100%"
      height={height}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Sparkline trend"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
