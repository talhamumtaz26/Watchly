import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData, exportData, importData, getSetting, updateSetting, getWatchLater, getWatched } from '../utils/storage';
import { syncLocalToCloud } from '../utils/cloudStorage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { FiArrowLeft, FiDatabase, FiDownload, FiUpload, FiTrash2, FiInfo, FiEye, FiEyeOff, FiCloud, FiCheck } from 'react-icons/fi';

const AppSettings = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [hideWatchedFromHome, setHideWatchedFromHome] = useState(getSetting('hideWatchedFromHome', false));
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();

  // Track data changes to reset sync status
  useEffect(() => {
    const checkDataChange = () => {
      setSynced(false);
    };

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', checkDataChange);
    
    // Also check periodically for local changes
    const interval = setInterval(() => {
      if (synced) {
        // Reset synced state after some time or when navigating back
        const lastSyncTime = sessionStorage.getItem('lastSyncTime');
        if (lastSyncTime && Date.now() - parseInt(lastSyncTime) > 5000) {
          setSynced(false);
        }
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', checkDataChange);
      clearInterval(interval);
    };
  }, [synced]);

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

  const handleSyncToCloud = async () => {
    if (!currentUser) {
      toast.error('Please login to sync with cloud');
      return;
    }

    setSyncing(true);
    setSynced(false);
    try {
      // Get local data
      const localWatchLater = getWatchLater();
      const localWatched = getWatched();
      
      if (localWatchLater.length === 0 && localWatched.length === 0) {
        toast.error('No local data to sync');
        setSyncing(false);
        return;
      }

      console.log('Syncing to cloud...', {
        watchLater: localWatchLater.length,
        watched: localWatched.length
      });

      // Sync to cloud
      const success = await syncLocalToCloud(currentUser.uid, {
        watchLater: localWatchLater,
        watched: localWatched,
      });

      if (success) {
        setSynced(true);
        sessionStorage.setItem('lastSyncTime', Date.now().toString());
      } else {
        toast.error('Failed to sync to cloud');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Error syncing to cloud');
    } finally {
      setSyncing(false);
    }
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

          {/* Cloud Sync */}
          {currentUser && (
            <div className="bg-card-dark rounded-xl p-5 shadow-md border border-gray-800">
              <h2 className="text-lg font-bold text-white mb-4">
                Cloud Sync
              </h2>
              
              <div className="space-y-3">
                {/* Manual Sync */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-sm text-white">Sync to Google Cloud</p>
                    <p className="text-xs text-gray-400">Upload local data to cloud storage</p>
                  </div>
                  <button
                    onClick={handleSyncToCloud}
                    disabled={syncing || synced}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 flex items-center gap-2 ${
                      synced 
                        ? 'bg-green-600 text-white cursor-default' 
                        : syncing 
                        ? 'bg-gray-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {syncing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Syncing...
                      </>
                    ) : synced ? (
                      <>
                        <FiCheck />
                        Synced
                      </>
                    ) : (
                      <>
                        <FiCloud />
                        Sync Now
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    <strong>Logged in as:</strong> {currentUser.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Your data automatically syncs when you add/remove items. Use this button to manually sync any local data to cloud.
                  </p>
                </div>
              </div>
            </div>
          )}

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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
