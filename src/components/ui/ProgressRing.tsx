interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string; // CSS var name like '--primary'
  trackColor?: string;
  label?: string;
  children?: React.ReactNode;
}

export default function ProgressRing({
  value,
  size = 140,
  stroke = 10,
  color = 'var(--primary)',
  trackColor,
  children,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c - clamped * c;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ring-progress">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="track-circ"
          style={{ stroke: trackColor }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ stroke: color }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
