/**
 * ExpandableCard — shared-element expansion into a full-screen workspace.
 * Level 1: renders a card that can expand to fill the viewport.
 */

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '../lib/cn';

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  expandedClassName?: string;
}

export function ExpandableCard({
  title,
  children,
  className,
  expandedClassName,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="popLayout">
        {!expanded ? (
          <div key="collapsed" className="rounded-2xl border border-glass-border bg-glass-surface overflow-hidden shadow-2 transition-all duration-panel ease-[var(--motion-easing)]">
            <div className="flex items-center justify-between p-4 border-b border-glass-border/50">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <button
                onClick={() => setExpanded(true)}
                aria-label={`Expand ${title}`}
                className="p-1 rounded-lg text-foreground-muted hover:bg-glass-border hover:text-foreground"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={import.meta.env.SSR || typeof document === 'undefined'
              ? {}
              : { type: 'spring', ...{ stiffness: 500, damping: 32 } }}
            className={cn(
              'fixed inset-0 z-[800] flex flex-col bg-glass-deep/95 backdrop-blur-xl border-b border-glass-border',
              'data-[glass=lite]:backdrop-blur-none data-[glass=lite]:bg-glass-surface/98',
              expandedClassName,
            )}
          >
            <div className="flex items-center justify-between p-5 border-b border-glass-border/50 shrink-0">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpanded(false)}
                  aria-label={`Collapse ${title}`}
                  className="p-1 rounded-lg text-foreground-muted hover:bg-glass-border hover:text-foreground"
                >
                  <Minimize className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
