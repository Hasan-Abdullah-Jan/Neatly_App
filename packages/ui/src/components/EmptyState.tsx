/**
 * EmptyState — designed empty state, never apologetic.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-6 w-16 h-16 rounded-3xl bg-glass-deep border border-glass-border flex items-center justify-center text-foreground-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-foreground-secondary max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
