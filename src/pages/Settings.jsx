import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiBarChart2, FiSettings as FiSettingsIcon, FiLogOut } from 'react-icons/fi';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header - Compact */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Settings
          </h1>
          <p className="text-sm text-gray-400">
            Manage your account and preferences
          </p>
        </div>

        {/* Menu Sections */}
        <div className="space-y-3">
          {/* Profile Section */}
          {currentUser ? (
            <div className="bg-card-dark rounded-xl p-5 shadow-md border border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-red flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-white text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white mb-1">Profile</h2>
                  <p className="text-sm text-gray-400 truncate">{currentUser.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Logged in</p>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="block bg-card-dark rounded-xl p-5 shadow-md border border-gray-800 hover:border-red-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-gray-400 text-2xl" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-1">Profile</h2>
                  <p className="text-sm text-gray-400">Click to login</p>
                </div>
              </div>
            </Link>
          )}

          {/* Dashboard Section */}
          <Link to="/dashboard" className="block bg-card-dark rounded-xl p-5 shadow-md border border-gray-800 hover:border-red-600 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                <FiBarChart2 className="text-red-600 text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Dashboard</h2>
                <p className="text-sm text-gray-400">View your statistics</p>
              </div>
            </div>
          </Link>

          {/* App Settings Section - Link to separate page */}
          <Link to="/app-settings" className="block bg-card-dark rounded-xl p-5 shadow-md border border-gray-800 hover:border-red-600 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                <FiSettingsIcon className="text-red-600 text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">App Settings</h2>
                <p className="text-sm text-gray-400">Preferences and data management</p>
              </div>
            </div>
          </Link>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full bg-card-dark hover:bg-red-600 rounded-xl p-5 shadow-md border border-gray-800 hover:border-red-600 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                <FiLogOut className="text-red-600 text-xl" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-lg font-bold text-white">Logout</h2>
                <p className="text-sm text-gray-400">Sign out of your account</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
