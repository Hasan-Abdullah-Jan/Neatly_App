/**
 * PhotoGrid — responsive photo grid.
 */

import { cn } from '../lib/cn';

interface PhotoGridProps {
  images: Array<{ src: string; alt?: string }>;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function PhotoGrid({
  images,
  cols = 3,
  className,
}: PhotoGridProps) {
  const colClasses = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
  return (
    <div
      className={cn(
        `grid gap-3 ${colClasses[cols]}`,
        'md:' + colClasses[cols],
        className,
      )}
    >
      {images.map((img, i) => (
        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-glass-border bg-glass-deep">
          <img
            src={img.src}
            alt={img.alt || ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
