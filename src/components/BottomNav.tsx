import { Link, useLocation } from 'react-router-dom';
import Icon from './ui/Icon';

const links = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/workouts', icon: 'fitness_center', label: 'Train' },
  { to: '/exercises', icon: 'sports_martial_arts', label: 'Moves' },
  { to: '/diet', icon: 'restaurant', label: 'Diet' },
  { to: '/coach', icon: 'auto_awesome', label: 'Coach' },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide nav on immersive sub-routes (active session, camera scan, onboarding)
  const hidden =
    /\/workouts\/[^/]+\/active/.test(location.pathname) ||
    location.pathname.includes('/diet/scan') ||
    location.pathname.includes('/onboarding');

  if (hidden) return null;

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="pixel-nav" aria-label="Primary">
      {links.map((link) => {
        const active = isActive(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`pixel-nav-item ${active ? 'active' : ''}`}
          >
            <Icon name={link.icon} filled={active} size={24} />
            <span className="label-text">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
