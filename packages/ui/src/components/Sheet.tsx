/**
 * Sheet — draggable bottom/side panel.
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from '../lib/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[600] flex flex-col" aria-modal="true" role="dialog" aria-labelledby="sheet-title">
      {/* Scrim */}
      <button onClick={onClose} className="absolute inset-0 bg-scrim z-[599] data-[motion=full]:animate-[fade_in_280ms_ease]" aria-label="Close sheet" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={import.meta.env.SSR || typeof document === 'undefined'
          ? {}
          : { type: 'spring', ...{ stiffness: 500, damping: 32 } }}
        className={cn(
          'relative z-[600] h-full max-h-[90vh] w-full rounded-t-3xl bg-glass-deep border-t border-glass-border shadow-3 flex flex-col',
          'data-[glass=lite]:backdrop-blur-none data-[glass=lite]:bg-glass-surface/95',
          'data-[glass=solid]:backdrop-blur-none data-[glass=solid]:bg-glass-surface',
          className,
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-glass-border/50">
          {title && (
            <div>
              <h2 id="sheet-title" className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            </div>
          )}
          <IconButton variant="ghost" size="sm" ariaLabel="Close sheet" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </motion.div>
    </div>
  );
}
