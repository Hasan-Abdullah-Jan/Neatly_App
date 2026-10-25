/**
 * Modal — centered overlay with escape-to-close and focus trap (basic).
 */

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from '../lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={import.meta.env.SSR || typeof document === 'undefined'
            ? {}
            : { duration: 0.28, ease: 'easeOut' }}
          className="fixed inset-0 z-[700] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-labelledby="modal-title"
        >
          {/* Scrim */}
          <button onClick={onClose} className="absolute inset-0 bg-scrim" aria-label="Close modal" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={import.meta.env.SSR || typeof document === 'undefined'
              ? {}
              : { type: 'spring', ...{ stiffness: 500, damping: 32 } }}
            className={cn(
              'relative w-full max-w-2xl rounded-3xl bg-glass-deep border border-glass-border shadow-3 flex flex-col',
              'data-[glass=lite]:backdrop-blur-none data-[glass=lite]:bg-glass-surface/95',
              'data-[glass=solid]:backdrop-blur-none data-[glass=solid]:bg-glass-surface',
              className,
            )}
          >
            <div className="flex items-center justify-between p-6 border-b border-glass-border/50">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              <IconButton variant="ghost" size="sm" ariaLabel="Close modal" onClick={onClose}>
                <X className="w-4 h-4" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
