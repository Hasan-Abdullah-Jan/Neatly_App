/**
 * ProgressOrb — SVG glass sphere with a clipped liquid body made of two sine waves
 * at different speeds. The level animates with a spring.
 *
 * Props:
 *   value — 0–100 primary level
 *   secondaryValue — paler liquid for submitted-but-unverified work
 *   label — accessible label
 *
 * Never animates on mount unless the value changed. Reduced Motion renders a
 * still fill. Exposes a text alternative.
 */

import { cn } from '../lib/cn';

interface ProgressOrbProps {
  value: number; // 0–100
  secondaryValue?: number; // 0–100, paler liquid
  label: string;
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'w-16 h-16',
  base: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const VIEW_BOX_SIZE = 200; // internal SVG coordinate space

// Two sine waves at different speeds for the liquid body
const WAVE_1 = {
  amplitude: 8,
  frequency: 0.03,
  speed: 0.5,
  phase: 0,
};
const WAVE_2 = {
  amplitude: 6,
  frequency: 0.045,
  speed: 0.3,
  phase: Math.PI / 2,
};

function wavePath(
  width: number,
  amplitude: number,
  frequency: number,
  phase: number,
  offsetY: number,
): string {
  const points: string[] = [`M 0 ${offsetY}`];
  for (let x = 0; x <= width; x += 5) {
    const y =
      offsetY +
      Math.sin((x / width) * Math.PI * 2 * frequency + phase) * amplitude;
    points.push(`L ${x} ${y}`);
  }
  points.push(
    `L ${width} ${offsetY} L ${width} ${VIEW_BOX_SIZE} L 0 ${VIEW_BOX_SIZE} Z`,
  );
  return points.join(' ');
}

export function ProgressOrb({
  value,
  secondaryValue,
  label,
  size = 'base',
  className,
}: ProgressOrbProps) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const percent = Math.min(100, Math.max(0, value));
  const secondaryPercent = secondaryValue
    ? Math.min(100, Math.max(0, secondaryValue))
    : 0;

  // fillY drives the liquid level; kept static at Level 1 (spring wiring in Level 2).
  void Math.round(VIEW_BOX_SIZE - percent * (VIEW_BOX_SIZE / 100));

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeStyles[size],
        className,
      )}
      aria-label={label}
      role="img"
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="orb-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
          </linearGradient>
          <radialGradient id="orb-sheen" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.6} />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
          <clipPath id="orb-clip">
            <circle cx="100" cy="100" r="90" />
          </clipPath>
        </defs>

        {/* Sphere outline */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="var(--color-glass-border)"
          strokeWidth="2"
        />
        <circle cx="100" cy="100" r="90" fill="url(#orb-gradient)" />
        <circle cx="100" cy="100" r="90" fill="url(#orb-sheen)" />

        {/* Liquid body (primary) — clipped to sphere, filled from bottom */}
        <g clipPath="url(#orb-clip)">
          <path
            d={wavePath(
              VIEW_BOX_SIZE,
              WAVE_1.amplitude,
              WAVE_1.frequency,
              WAVE_1.phase,
              VIEW_BOX_SIZE - percent * (VIEW_BOX_SIZE / 100),
            )}
            fill="var(--color-liquid-blue)"
            opacity={0.85}
          />
          <path
            d={wavePath(
              VIEW_BOX_SIZE,
              WAVE_2.amplitude,
              WAVE_2.frequency,
              WAVE_2.phase,
              VIEW_BOX_SIZE - percent * (VIEW_BOX_SIZE / 100),
            )}
            fill="var(--color-liquid-blue)"
            opacity={0.6}
          />
        </g>

        {/* Secondary liquid (paler, for submitted-but-unverified) */}
        {secondaryPercent > 0 && secondaryPercent > percent && (
          <g clipPath="url(#orb-clip)">
            <path
              d={wavePath(
                VIEW_BOX_SIZE,
                WAVE_1.amplitude,
                WAVE_1.frequency,
                WAVE_1.phase + Math.PI,
                VIEW_BOX_SIZE -
                  secondaryPercent * (VIEW_BOX_SIZE / 100),
              )}
              fill="var(--color-liquid-blue)"
              opacity={0.35}
            />
          </g>
        )}
      </svg>

      {/* Still fill fallback for Reduced Motion */}
      {reducedMotion && (
        <div
          className="absolute inset-0 rounded-full bg-liquid-blue/40"
          style={{
            clipPath: `inset(${100 - percent}% 0% 0% 0%)`,
            transition: 'none',
          }}
        />
      )}
    </div>
  );
}
