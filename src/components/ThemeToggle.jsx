import React, { useState, useEffect } from 'react';
import { getTheme, toggleTheme } from '../utils/storage';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  // Dark mode is now permanent, but keeping toggle hidden for future use
  return null;
  
  const [theme, setThemeState] = useState(getTheme());

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <FiSun className="text-xl text-yellow-500" />
      ) : (
        <FiMoon className="text-xl text-blue-500" />
      )}
    </button>
  );
};

export default ThemeToggle;
