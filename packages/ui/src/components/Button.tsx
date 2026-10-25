/**
 * Button primitive (Radix Slot) + LiquidButton variants.
 *
 * LiquidButton:
 *   - compresses to 0.97 on press
 *   - brightens
 *   - a highlight travels across
 *   - spring release
 *   - built-in loading and success morph
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';
import { Check, Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
  success?: boolean;
  asChild?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-liquid-blue text-inverse hover:bg-liquid-blue-dim focus-visible:ring-2 focus-visible:ring-liquid-blue',
  secondary:
    'bg-glass-deep text-foreground border border-glass-border hover:bg-glass-surface focus-visible:ring-2 focus-visible:ring-liquid-blue',
  ghost:
    'bg-transparent text-foreground-secondary hover:bg-glass-deep focus-visible:ring-2 focus-visible:ring-liquid-blue',
  danger:
    'bg-error text-inverse hover:bg-error/90 focus-visible:ring-2 focus-visible:ring-error',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  base: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'base',
  loading = false,
  success = false,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'rounded-pill font-medium whitespace-nowrap',
        'transition-all duration-release ease-[var(--motion-easing)]',
        'active:scale-95',
        'data-[loading]:opacity-80 data-[loading]:pointer-events-none',
        'data-[success]:bg-success data-[success]:text-inverse',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      data-loading={loading ? '' : undefined}
      data-success={success ? '' : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {success ? (
        <Check className="w-4 h-4" />
      ) : loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        children
      )}
    </Comp>
  );
}

/**
 * LiquidButton — the premium button with a traveling highlight and spring release.
 */
interface LiquidButtonProps extends ButtonProps {
  highlight?: boolean;
}

export function LiquidButton({
  highlight = true,
  className,
  ...props
}: LiquidButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  const handlePointerDown = () => setPressed(true);
  const handlePointerUp = () => setPressed(false);

  return (
    <Button
      {...props}
      className={cn(
        'overflow-hidden',
        pressed &&
          highlight &&
          'before:content-[""] before:absolute before:inset-0 before:bg-gradient-to-r before:[background-image:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] before:-translate-x-full before:transition-none',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {props.children}
    </Button>
  );
}
