import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  size?: 'xl' | 'lg';
}

export default function PageHeader({ title, subtitle, back, right, size = 'xl' }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="pt-6 px-5 pb-4">
      <div className="flex items-center justify-between mb-2">
        {back ? (
          <button
            onClick={() => navigate(-1)}
            className="m3-iconbtn"
            style={{ background: 'color-mix(in srgb, var(--surface-container) 70%, transparent)' }}
          >
            <Icon name="arrow_back" size={22} />
          </button>
        ) : (
          <div style={{ width: 44 }} />
        )}
        <div style={{ width: 44 }}>{right}</div>
      </div>
      <h1 className={size === 'xl' ? 'display-xl' : 'display-lg'}>{title}</h1>
      {subtitle && (
        <p className="opacity-60 mt-2 text-sm font-medium tracking-wide">
          {subtitle}
        </p>
      )}
    </header>
  );
}
