/**
 * QRCodeView — renders a QR code (client-side, no external deps at Level 1).
 * Uses a simple SVG-based QR rendering placeholder; in production this would
 * be replaced by a dedicated library.
 */

import { cn } from '../lib/cn';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Very small QR-like pattern placeholder for Level 1.
 * Draws a matrix of modules based on a hash of the value.
 * Not a real QR code — replace with a proper QR library (e.g. qrcode) later.
 */
function generateModules(value: string, size: number): Array<Array<boolean>> {
  const modules = size;
  const grid: Array<Array<boolean>> = [];
  for (let y = 0; y < modules; y++) {
    const row: Array<boolean> = [];
    for (let x = 0; x < modules; x++) {
      const hash = (value.charCodeAt(x % value.length) * 17 + y * 31) % 3;
      row.push(hash === 0);
    }
    grid.push(row);
  }
  // Finder patterns (corners)
  const markCorner = (g: Array<Array<boolean>>, ox: number, oy: number) => {
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        g[oy + dy][ox + dx] = (dy === 0 || dy === 2 || dx === 0 || dx === 2);
      }
    }
  };
  markCorner(grid, 0, 0);
  markCorner(grid, modules - 3, 0);
  markCorner(grid, 0, modules - 3);
  return grid;
}

export function QRCodeView({
  value,
  size = 160,
  className,
}: QRCodeViewProps) {
  const modules = 7;
  const grid = generateModules(value, modules);
  const moduleSize = size / modules;

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center gap-2 p-4 rounded-2xl border border-glass-border bg-white',
        className,
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="QR code"
      >
        {grid.flatMap((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * moduleSize}
                y={y * moduleSize}
                width={moduleSize}
                height={moduleSize}
                fill="#000000"
              />
            ) : null,
          ),
        )}
      </svg>
      <span className="text-xs text-foreground-muted break-all max-w-xs">
        {value}
      </span>
    </div>
  );
}
