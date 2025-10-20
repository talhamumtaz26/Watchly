import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData, exportData, importData, getSetting, updateSetting } from '../utils/storage';
import { useToast } from '../components/Toast';
import { FiArrowLeft, FiDatabase, FiDownload, FiUpload, FiTrash2, FiInfo, FiEye, FiEyeOff } from 'react-icons/fi';

const AppSettings = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [hideWatchedFromHome, setHideWatchedFromHome] = useState(getSetting('hideWatchedFromHome', false));
  const navigate = useNavigate();
  const toast = useToast();

  const handleClearData = () => {
    if (showConfirm) {
      clearAllData();
      setShowConfirm(false);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setShowConfirm(true);
    }
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchly-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          importData(data);
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleToggleHideWatched = () => {
    const newValue = !hideWatchedFromHome;
    setHideWatchedFromHome(newValue);
    updateSetting('hideWatchedFromHome', newValue);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <FiArrowLeft className="text-xl" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            App Settings
          </h1>
          <p className="text-sm text-gray-400">
            Manage preferences and data
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Preferences */}
          <div className="bg-card-dark rounded-xl p-5 shadow-md border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">Preferences</h2>
            
            {/* Hide Watched Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">
                  Hide Watched on Home
                </p>
                <p className="text-xs text-gray-400">
                  Hide watched movies from home page
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleHideWatched}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    hideWatchedFromHome ? 'bg-white' : 'bg-black border-2 border-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                      hideWatchedFromHome ? 'bg-red-600 translate-x-6' : 'bg-white translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-card-dark rounded-xl p-5 shadow-md border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">
              Data Management
            </h2>
            
            <div className="space-y-3">
              {/* Export Data */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-sm text-white">Export Data</p>
                  <p className="text-xs text-gray-400">Download backup</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
                >
                  Export
                </button>
              </div>

              {/* Import Data */}
              <div className="flex items-center justify-between py-2 border-t border-gray-800">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-sm text-white">Import Data</p>
                  <p className="text-xs text-gray-400">Restore from backup</p>
                </div>
                <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex-shrink-0">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Clear Data */}
              <div className="flex items-center justify-between py-2 border-t border-gray-800">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-sm text-white">Clear All Data</p>
                  <p className="text-xs text-gray-400">Remove everything (cannot be undone)</p>
                </div>
                <button
                  onClick={handleClearData}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${
                    showConfirm
                      ? 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {showConfirm ? 'Confirm?' : 'Clear'}
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-card-dark rounded-xl p-5 shadow-md border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">
              About
            </h2>
            <div className="grid grid-cols-3 gap-3 text-sm text-gray-300">
              <div>
                <p className="text-xs text-gray-400">Version</p>
                <p className="font-semibold">1.0.0</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Author</p>
                <p className="font-semibold">Talha Malik</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Type</p>
                <p className="font-semibold">Movie Tracker</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
