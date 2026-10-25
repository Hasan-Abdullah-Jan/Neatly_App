/**
 * IconButton — round pill/glass icon button.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'base' | 'lg';
  ariaLabel: string;
  children: React.ReactNode;
}

const iconVariantStyles = {
  primary: 'bg-liquid-blue text-inverse hover:bg-liquid-blue-dim',
  secondary: 'bg-glass-deep text-foreground hover:bg-glass-surface',
  ghost: 'bg-transparent text-foreground-secondary hover:bg-glass-deep',
  danger: 'bg-error text-inverse hover:bg-error/90',
};

const iconSizeStyles = {
  sm: 'p-1.5',
  base: 'p-2',
  lg: 'p-2.5',
};

export function IconButton({
  variant = 'ghost',
  size = 'base',
  ariaLabel,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-full',
        'transition-colors duration-release ease-[var(--motion-easing)]',
        'active:scale-90',
        iconVariantStyles[variant],
        iconSizeStyles[size],
        className,
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}
