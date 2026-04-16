import { ButtonHTMLAttributes, ReactNode } from 'react';
import Icon from './Icon';

type Variant = 'filled' | 'tonal' | 'tertiary-tonal' | 'outlined' | 'text';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: string;
  trailingIcon?: string;
  xl?: boolean;
  children: ReactNode;
  glow?: boolean;
}

const variantClass: Record<Variant, string> = {
  filled: 'm3-btn-filled',
  tonal: 'm3-btn-tonal',
  'tertiary-tonal': 'm3-btn-tertiary-tonal',
  outlined: 'm3-btn-outlined',
  text: 'm3-btn-text',
};

export default function Button({
  variant = 'filled',
  icon,
  trailingIcon,
  xl,
  children,
  glow,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`m3-btn ${variantClass[variant]} ${xl ? 'm3-btn-xl' : ''} ${
        glow ? 'glow-ring relative' : ''
      } ${className}`}
    >
      {icon && <Icon name={icon} filled size={xl ? 22 : 20} />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={xl ? 22 : 20} />}
    </button>
  );
}
