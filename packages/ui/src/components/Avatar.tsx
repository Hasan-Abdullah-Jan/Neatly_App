/**
 * Avatar — circular user/space image with fallback initials.
 */

import * as React from 'react';
import { User } from 'lucide-react';
import { cn } from '../lib/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  base: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export function Avatar({
  src,
  alt,
  name,
  size = 'base',
  className,
  ...props
}: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        'relative flex-shrink-0 rounded-full overflow-hidden border border-glass-border',
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-liquid-blue/10 text-liquid-blue">
          <User className="w-4 h-4" aria-hidden="true" />
          {initials && <span className="font-medium">{initials}</span>}
        </div>
      )}
    </div>
  );
}
