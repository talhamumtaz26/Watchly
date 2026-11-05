import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import Wordmark from './Wordmark';
import { getActiveTab, navItems } from '../config/navItems';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const activeTab = getActiveTab(location.pathname);

  const handleSearchClick = () => {
    if (isSearchPage) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/search');
    }
  };

  return (
    <nav aria-label="Main navigation" className="glass glass-nav sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center group">
            <Wordmark />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === '/'}
                aria-current={activeTab === item.key ? 'page' : undefined}
                className={`relative py-2 text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
                  activeTab === item.key
                    ? 'text-brand after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-brand'
                    : 'text-fg-secondary hover:text-fg'
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Search Icon / Close Button */}
          <button 
            onClick={handleSearchClick}
            className="text-fg p-3 min-w-11 min-h-11 flex items-center justify-center hover:bg-surface rounded-md transition-colors"
            aria-label={isSearchPage ? 'Close search' : 'Open search'}
            title={isSearchPage ? 'Close search' : 'Open search'}
          >
            {isSearchPage ? (
              <X size={24} weight="regular" aria-hidden="true" />
            ) : (
              <MagnifyingGlass size={24} weight="regular" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
