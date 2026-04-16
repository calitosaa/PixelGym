import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/workouts', icon: 'fitness_center', label: 'Workouts' },
    { to: '/diet', icon: 'restaurant', label: 'Diet' },
    { to: '/coach', icon: 'smart_toy', label: 'Coach' },
  ];

  return (
    <nav className="pixel-nav">
      {links.map((link) => {
        const isActive = location.pathname === link.to;

        return (
          <Link
            key={link.to}
            to={link.to}
            className={`pixel-nav-item ${isActive ? 'active' : ''}`}
          >
            <i>{link.icon}</i>
          </Link>
        );
      })}
    </nav>
  );
}
