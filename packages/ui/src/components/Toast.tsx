/**
 * Toast — non-blocking feedback banner.
 */

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/cn';

type ToastType = 'info' | 'success' | 'warning' | 'error';

const toastStyles: Record<ToastType, string> = {
  info: 'bg-glass-deep border border-liquid-blue/30 text-foreground',
  success: 'bg-green/10 border border-green/20 text-green-foreground',
  warning: 'bg-amber/10 border border-amber/20 text-amber-foreground',
  error: 'bg-error/10 border border-error/20 text-error-foreground',
};

interface ToastProps {
  id: string;
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  onDismiss?: (id: string) => void;
}

export function Toast({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  onDismiss,
}: ToastProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(id), 300);
    }, duration);
    return () => clearTimeout(t);
  }, [id, duration, onDismiss]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={import.meta.env.SSR || typeof document === 'undefined'
          ? {}
          : { type: 'spring', ...{ stiffness: 420, damping: 28 } }}
        className={cn(
          'fixed bottom-6 right-6 z-[800] w-80 rounded-2xl border border-glass-border px-5 py-4 shadow-3',
          'backdrop-blur-md',
          'data-[glass=lite]:backdrop-blur-none data-[glass=lite]:bg-glass-surface/90',
          'data-[glass=solid]:backdrop-blur-none data-[glass=solid]:bg-glass-surface',
          toastStyles[type],
        )}
      >
        <div className="flex items-start gap-3">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {message && <p className="text-sm text-foreground-secondary">{message}</p>}
          <button
            onClick={() => {
              setVisible(false);
              onClose?.();
              onDismiss?.(id);
            }}
            aria-label="Dismiss toast"
            className="absolute top-4 right-4 p-1 rounded-full text-foreground-muted hover:text-foreground"
          >
            <span className="sr-only">Dismiss</span>
            <span className="w-4 h-4" aria-hidden="true">✕</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
