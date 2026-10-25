/**
 * StatCounter — rolling digits counter.
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

interface StatCounterProps {
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  animate?: boolean;
}

function rollDigits(
  value: string | number,
): Array<{ char: string; index: number }> {
  const str = String(value);
  return str.split('').map((char, index) => ({ char, index }));
}

export function StatCounter({
  value,
  label,
  prefix,
  suffix,
  className,
  animate = true,
}: StatCounterProps) {
  const [prevValue, setPrevValue] = React.useState<string | number>(value);

  React.useEffect(() => {
    setPrevValue(value);
  }, [value]);

  const digits = rollDigits(prevValue);
  const showSuffix = suffix ? ` ${suffix}` : '';
  const showPrefix = prefix ? `${prefix} ` : '';

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <div className="flex items-baseline gap-1">
        {showPrefix && (
          <span className="text-sm text-foreground-muted">{showPrefix}</span>
        )}
        {digits.map(({ char, index }) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={animate ? { type: 'spring', ...{ stiffness: 500, damping: 32 } } : { duration: 0 }}
            className="text-2xl font-semibold text-foreground tabular-nums"
          >
            {char}
          </motion.span>
        ))}
        {showSuffix && (
          <span className="text-sm text-foreground-muted">{showSuffix}</span>
        )}
      </div>
      <span className="text-xs text-foreground-muted">{label}</span>
    </div>
  );
}
