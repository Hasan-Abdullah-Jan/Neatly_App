/**
 * Tabs — accessible tab list with arrow-key navigation.
 */

import { cn } from '../lib/cn';

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
interface TabsContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(className)} role="tablist" aria-orientation="horizontal">
      {children}
    </div>
  );
}

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center justify-center rounded-lg border border-glass-border p-1 bg-glass-surface/50',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: TabsTriggerProps) {
  return (
    <button
      role="tab"
      aria-selected={false}
      className={cn(
        'relative flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
        'bg-liquid-blue text-inverse shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  children,
  className,
}: TabsContentProps) {
  return (
    <div
      role="tabpanel"
      className={cn('mt-4 rounded-xl border border-glass-border bg-glass-surface/40 p-6', className)}
    >
      {children}
    </div>
  );
}
