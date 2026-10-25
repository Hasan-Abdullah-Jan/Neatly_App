/**
 * Badge — status indicator dot/text.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const badgeStyles = {
  default: 'bg-glass-border text-foreground-secondary border border-glass-border',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  error: 'bg-error/10 text-error border border-error/20',
  info: 'bg-info/10 text-info border border-info/20',
};

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        badgeStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
