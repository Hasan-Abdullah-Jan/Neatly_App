/**
 * GlassSurface — the foundational liquid-glass container.
 *
 * Levels 1–3:
 *   - backdrop blur (per data-glass mode)
 *   - 1 px inner highlight
 *   - top-edge sheen
 *   - soft layered shadow
 *
 * Glass modes:
 *   liquid  — full backdrop blur + sheen + shadow (premium)
 *   lite    — no backdrop blur, border-only glass (performant fallback)
 *   solid   — opaque surface, no blur (maximum performance / reduced transparency)
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  inset?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function GlassSurface({
  level = 1,
  inset = false,
  children,
  className,
  ...props
}: GlassSurfaceProps) {
  return (
    <div
      data-glass-level={level}
      data-inset={inset ? 'true' : undefined}
      className={cn(
        'relative overflow-hidden',
        // Base glass: border + background
        'border border-glass-border/60 bg-glass-surface/80',
        // Shadow by level
        level === 1 ? 'shadow-1' : level === 2 ? 'shadow-2' : 'shadow-3',
        // Rounded main card
        'rounded-2xl',
        // Inset variant: inner highlight via border + shadow inset
        inset && 'inset-0 shadow-[inset_0_0_0_1px_var(--color-glass-border)]',
        className,
      )}
      {...props}
    >
      {/* Top-edge sheen — a subtle diagonal highlight at the top edge */}
      <div
        className={cn(
          'absolute inset-0 -z-10 pointer-events-none',
          // Liquid: gradient sheen; lite/solid: none
          'data-[glass=liquid]:before:content-[""]',
          'data-[glass=liquid]:before:absolute',
          'data-[glass=liquid]:before:inset-0',
          'data-[glass=liquid]:before:bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.00)_60%)]',
          'data-[glass=liquid]:before:rounded-2xl',
          'data-[glass=liquid]:before:mix-blend-overlay',
          // Lite/solid: no sheen
          'data-[glass=lite]:before:hidden',
          'data-[glass=solid]:before:hidden',
        )}
      />

      {/* Backdrop blur layer — only when glass=liquid and not reduced transparency */}
      <div
        className={cn(
          'absolute inset-0 -z-10 pointer-events-none',
          'data-[glass=liquid]:backdrop-blur-md',
          'data-[glass=liquid]:-backdrop-brightness-105',
          'data-[glass=lite]:backdrop-blur-none',
          'data-[glass=solid]:backdrop-blur-none',
          // Reduced transparency: drop blur
          'data-[data-motion=reduced][data-glass=liquid]:backdrop-blur-none',
          'data-[data-contrast=high][data-glass=liquid]:backdrop-blur-none',
        )}
      />

      {children}
    </div>
  );
}
