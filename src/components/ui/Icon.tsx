import { CSSProperties } from 'react';

interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Icon({ name, filled = false, size, className = '', style }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded ${filled ? 'fill' : ''} ${className}`}
      style={{
        fontSize: size ? `${size}px` : undefined,
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
          : undefined,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
