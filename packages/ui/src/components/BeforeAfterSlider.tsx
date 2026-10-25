/**
 * BeforeAfterSlider — drag handle to compare two images.
 */

import * as React from 'react';
import { cn } from '../lib/cn';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  label?: string;
  className?: string;
}

export function BeforeAfterSlider({
  before,
  after,
  label,
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = React.useState(50);

  const handleMove = (clientX: number) => {
    const rect = document.querySelector('.before-after-slider')?.getBoundingClientRect();
    if (!rect) return;
    let p = ((clientX - rect.left) / rect.width) * 100;
    p = Math.min(100, Math.max(0, p));
    setPosition(p);
  };

  return (
    <div
      className={cn(
        'relative before-after-slider h-64 rounded-xl overflow-hidden border border-glass-border',
        className,
      )}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={() => {}}
      onMouseDown={(e) => handleMove(e.clientX)}
      role="slider"
      aria-valuenow={position}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Before/After comparison'}
    >
      <div className="absolute inset-0 w-full h-full">
        <img src={before} alt="" className="w-full h-full object-cover" aria-hidden="true" />
      </div>
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={after} alt="" className="w-full h-full object-cover" aria-hidden="true" />
      </div>
      <div
        className="absolute top-0 bottom-0 left-[calc(50%-10px)] w-20 cursor-ew-resize"
        style={{ left: `calc(${position}% - 10px)` }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-liquid-blue shadow-2" />
        <div className="absolute left-1/2 w-px h-full bg-white/30" style={{ left: '50%' }} />
      </div>
    </div>
  );
}
