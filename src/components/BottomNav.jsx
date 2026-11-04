import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiClock, FiBookmark, FiCheckCircle, FiUser } from 'react-icons/fi';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/upcoming', label: 'Upcoming', icon: FiClock },
    { path: '/watch-later', label: 'Watch Later', icon: FiBookmark },
    { path: '/watched', label: 'Watched', icon: FiCheckCircle },
    { path: '/settings', label: 'Settings', icon: FiUser },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 bg-bg border-t border-line z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-brand' : 'text-fg-secondary'
              }`}
            >
              <Icon className={`text-xl mb-1 ${active ? 'text-brand' : 'text-fg-secondary'}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
