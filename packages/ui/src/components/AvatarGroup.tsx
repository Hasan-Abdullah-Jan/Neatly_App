/**
 * AvatarGroup — stack of avatars with overflow count.
 */

import { Avatar } from './Avatar';
import { cn } from '../lib/cn';

interface AvatarGroupProps {
  users: Array<{ src?: string; name?: string }>;
  max?: number;
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

export function AvatarGroup({
  users,
  max = 3,
  size = 'base',
  className,
}: AvatarGroupProps) {
  const overflow = users.length - max;
  return (
    <div
      className={cn(
        'flex items-center -space-x-2',
        'data-[dir=rtl]:space-x-reverse',
        className,
      )}
    >
      {users.slice(0, max).map((user, i) => (
        <Avatar key={i} src={user.src} name={user.name} size={size} />
      ))}
      {overflow > 0 && (
        <div className="ml-1 rounded-full border border-glass-border bg-glass-surface px-1.5 py-0.5 text-xs text-foreground-secondary">
          +{overflow}
        </div>
      )}
    </div>
  );
}
