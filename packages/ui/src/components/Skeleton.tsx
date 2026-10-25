/**
 * Skeleton — loading placeholder.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'circle' | 'text' | 'block';
  className?: string;
}

export function Skeleton({
  variant = 'block',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-full bg-glass-deep',
        variant === 'circle' ? 'w-10 h-10' : variant === 'text' ? 'h-4 w-32' : 'h-full w-full',
        className,
      )}
      {...props}
    />
  );
}
