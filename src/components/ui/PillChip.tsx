import { ReactNode } from 'react';
import Icon from './Icon';

interface PillChipProps {
  active?: boolean;
  onClick?: () => void;
  icon?: string;
  children: ReactNode;
  variant?: 'primary' | 'tertiary';
  className?: string;
}

export default function PillChip({
  active,
  onClick,
  icon,
  children,
  variant = 'primary',
  className = '',
}: PillChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pill-chip ${active ? `active ${variant === 'tertiary' ? 'tertiary' : ''}` : ''} ${className}`}
    >
      {icon && <Icon name={icon} filled={active} size={18} />}
      <span>{children}</span>
    </button>
  );
}
