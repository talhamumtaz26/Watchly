import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import Wordmark from './Wordmark';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';

  const handleSearchClick = () => {
    if (isSearchPage) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/search');
    }
  };

  return (
    <nav aria-label="Main navigation" className="bg-bg sticky top-0 z-40 border-b border-line">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center group">
            <Wordmark />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            <Link 
              to="/" 
              className="text-fg hover:text-brand font-semibold transition-colors"
            >
              <span className="text-sm lg:text-base whitespace-nowrap">Home</span>
            </Link>
            <Link 
              to="/upcoming" 
              className="text-fg hover:text-brand font-semibold transition-colors"
            >
              <span className="text-sm lg:text-base whitespace-nowrap">Upcoming</span>
            </Link>
            <Link 
              to="/watch-later" 
              className="text-fg hover:text-brand font-semibold transition-colors"
            >
              <span className="text-sm lg:text-base whitespace-nowrap">Watch Later</span>
            </Link>
            <Link 
              to="/watched" 
              className="text-fg hover:text-brand font-semibold transition-colors"
            >
              <span className="text-sm lg:text-base whitespace-nowrap">Watched</span>
            </Link>
            <Link 
              to="/settings" 
              className="text-fg hover:text-brand font-semibold transition-colors"
            >
              <span className="text-sm lg:text-base whitespace-nowrap">Settings</span>
            </Link>
          </div>

          {/* Search Icon / Close Button */}
          <button 
            onClick={handleSearchClick}
            className="text-fg p-3 min-w-11 min-h-11 flex items-center justify-center hover:bg-surface rounded-md transition-colors"
            aria-label={isSearchPage ? 'Close search' : 'Open search'}
            title={isSearchPage ? 'Close search' : 'Open search'}
          >
            {isSearchPage ? (
              <FiX className="text-2xl" />
            ) : (
              <FiSearch className="text-2xl" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
