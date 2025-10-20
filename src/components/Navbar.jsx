import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiX, FiHome, FiCalendar, FiClock, FiCheckCircle, FiSettings } from 'react-icons/fi';

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
    <nav className="bg-black shadow-2xl sticky top-0 z-40 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="Watchly" 
              className="h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            <Link 
              to="/" 
              className="text-white hover:text-red-600 font-semibold transition-colors flex items-center gap-1.5"
            >
              <FiHome className="text-lg" />
              <span className="text-sm lg:text-base whitespace-nowrap">Home</span>
            </Link>
            <Link 
              to="/upcoming" 
              className="text-white hover:text-red-600 font-semibold transition-colors flex items-center gap-1.5"
            >
              <FiCalendar className="text-lg" />
              <span className="text-sm lg:text-base whitespace-nowrap">Upcoming</span>
            </Link>
            <Link 
              to="/watch-later" 
              className="text-white hover:text-red-600 font-semibold transition-colors flex items-center gap-1.5"
            >
              <FiClock className="text-lg" />
              <span className="text-sm lg:text-base whitespace-nowrap">Watch Later</span>
            </Link>
            <Link 
              to="/watched" 
              className="text-white hover:text-red-600 font-semibold transition-colors flex items-center gap-1.5"
            >
              <FiCheckCircle className="text-lg" />
              <span className="text-sm lg:text-base whitespace-nowrap">Watched</span>
            </Link>
            <Link 
              to="/settings" 
              className="text-white hover:text-red-600 font-semibold transition-colors flex items-center gap-1.5"
            >
              <FiSettings className="text-lg" />
              <span className="text-sm lg:text-base whitespace-nowrap">Settings</span>
            </Link>
          </div>

          {/* Search Icon / Close Button */}
          <button 
            onClick={handleSearchClick}
            className="text-white p-2 hover:bg-gray-900 rounded-lg transition-colors"
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
