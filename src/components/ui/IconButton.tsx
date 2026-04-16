import { ButtonHTMLAttributes } from 'react';
import Icon from './Icon';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  filled?: boolean;
  size?: number;
  iconSize?: number;
}

export default function IconButton({
  name,
  filled,
  size = 44,
  iconSize = 22,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`m3-iconbtn ${className}`}
      style={{ width: size, height: size, ...rest.style }}
    >
      <Icon name={name} filled={filled} size={iconSize} />
    </button>
  );
}
