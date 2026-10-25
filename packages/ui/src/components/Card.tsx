/**
 * Card — base card with glass surface, main radius (22–28px).
 */

import * as React from 'react';
import { GlassSurface } from './GlassSurface';
import { cn } from '../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  padding?: 'none' | 'sm' | 'base' | 'lg';
  children: React.ReactNode;
}

export function Card({
  level = 2,
  padding = 'base',
  children,
  className,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    base: 'p-6',
    lg: 'p-8',
  };

  return (
    <GlassSurface level={level} className={cn(paddingStyles[padding], className)} {...props}>
      {children}
    </GlassSurface>
  );
}
