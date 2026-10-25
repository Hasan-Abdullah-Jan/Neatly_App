/**
 * Timeline — vertical timeline of events.
 */

import { cn } from '../lib/cn';

interface TimelineItem {
  title: string;
  time?: string;
  status?: 'pending' | 'done' | 'active';
  description?: string;
}

interface TimelineProps {
  items: Array<TimelineItem>;
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative px-4', className)}>
      <div className="absolute inset-y-0 left-2 w-px bg-glass-border" />
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <div key={i} className="relative pl-10 pb-8">
            <div className="absolute -left-[7px] top-2 w-4 h-4 rounded-full border-2 border-glass-border">
              {item.status === 'done' && (
                <div className="absolute inset-0 bg-success rounded-full" />
              )}
              {item.status === 'active' && (
                <div className="absolute inset-0 bg-liquid-blue rounded-full animate-pulse" />
              )}
            </div>
            {!last && (
              <div className="absolute -left-1 top-8 bottom-[8px] w-px bg-glass-border" />
            )}
            <div className="text-sm text-foreground">{item.title}</div>
            {item.time && (
              <div className="text-xs text-foreground-muted">{item.time}</div>
            )}
            {item.description && (
              <div className="text-xs text-foreground-secondary mt-1">{item.description}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
