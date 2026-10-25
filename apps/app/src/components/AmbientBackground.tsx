/**
 * AmbientBackground — three blurred gradient shapes drifting under 1 px per
 * second underneath the content. Paused when the tab is hidden or Reduced
 * Motion is on.
 */



const SHAPES = [
  { color: '#3b82f6', x: -10, y: 20, size: 600, delay: 0 },
  { color: '#c084fc', x: 110, y: -40, size: 500, delay: 2 },
  { color: '#22c55e', x: 60, y: 120, size: 450, delay: 4 },
] as const;

export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {SHAPES.map((shape, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[128px] opacity-40"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            background: `radial-gradient(circle, ${shape.color}33 0%, transparent 70%)`,
            animation: `drift ${20 + i * 4}s ease-in-out infinite alternate`,
            animationDelay: `${shape.delay}s`,
            // Paused when hidden or Reduced Motion via CSS
          }}
        />
      ))}
      <style>{`
        @keyframes drift {
          from { transform: translate(0, 0); }
          to { transform: translate(calc(var(--ambient-dx, 4px)), calc(var(--ambient-dy, -2px))); }
        }
        [data-motion='reduced'] .blur-\\[128px\\] { animation: none !important; }
        [data-ambient-paused='1'] .blur-\\[128px\\] { animation-play-state: paused !important; }
      `}</style>
    </div>
  );
}
