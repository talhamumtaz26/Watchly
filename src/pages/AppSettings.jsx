import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllData, exportData, importData, getSetting, updateSetting, getWatchLater, getWatched } from '../utils/storage';
import { syncBidirectional, clearCloudData } from '../utils/cloudStorage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { FiArrowLeft, FiCloud, FiCheck } from 'react-icons/fi';
import { APP_NAME } from '../config/app';
import { useAppearancePreference } from '../hooks/useAppearancePreference';

const AppSettings = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [hideWatchedFromHome, setHideWatchedFromHome] = useState(getSetting('hideWatchedFromHome', false));
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [syncSummary, setSyncSummary] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const { reduceGlassEffects, toggleReduceGlassEffects } = useAppearancePreference();

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

  const handleClearData = async () => {
    if (showConfirm && confirmText === 'CLEAR ALL') {
      if (currentUser) {
        try {
          await clearCloudData(currentUser.uid);
        } catch (error) {
          console.error('Cloud clear error:', error);
          toast.error('Could not clear cloud data');
          return;
        }
      }
      clearAllData();
      setShowConfirm(false);
      setConfirmText('');
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
          toast.success('Data imported successfully');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          console.error('Import error:', error);
          toast.error(error.message || 'Invalid backup file');
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
    setSyncSummary(null);
    try {
      // Get local data
      const localWatchLater = getWatchLater();
      const localWatched = getWatched();

      // Sync bidirectionally
      const result = await syncBidirectional(currentUser.uid, {
        watchLater: localWatchLater,
        watched: localWatched,
      });

      if (result.success) {
        const uploaded = result.uploaded.watchLater + result.uploaded.watched;
        const downloaded = result.downloaded.watchLater + result.downloaded.watched;
        toast.success(`Sync complete: ${uploaded} uploaded, ${downloaded} downloaded`);
        setSynced(true);
        setSyncSummary(result);
        sessionStorage.setItem('lastSyncTime', Date.now().toString());
      } else {
        setSyncSummary(result);
        toast.error(result.failures?.[0] || 'Some data could not be synced');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Error syncing to cloud');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-fg-secondary hover:text-fg transition-colors mb-6"
        >
          <FiArrowLeft className="text-xl" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-fg mb-1">
            App Settings
          </h1>
          <p className="text-sm text-fg-secondary">
            Manage preferences and data
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Preferences */}
          <div className="bg-surface rounded-md p-5  border border-line">
            <h2 className="text-lg font-bold text-fg mb-4">Preferences</h2>
            
            {/* Hide Watched Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex-1">
                <p className="font-semibold text-sm text-fg">
                  Hide Watched on Home
                </p>
                <p className="text-xs text-fg-secondary">
                  Hide watched movies from home page
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleHideWatched}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    hideWatchedFromHome ? 'bg-fg' : 'bg-bg border-2 border-fg-muted'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full  transform transition-transform duration-300 ${
                      hideWatchedFromHome ? 'bg-brand translate-x-6' : 'bg-fg translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-surface rounded-md p-5 border border-line">
            <h2 className="text-lg font-bold text-fg mb-4">Appearance</h2>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 pr-4">
                <p className="font-semibold text-sm text-fg">Reduce glass effects</p>
                <p className="text-xs text-fg-secondary">Use solid surfaces instead of transparency</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reduceGlassEffects}
                aria-label="Reduce glass effects"
                onClick={toggleReduceGlassEffects}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  reduceGlassEffects ? 'bg-fg' : 'bg-bg border-2 border-fg-muted'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transform transition-transform duration-300 ${
                    reduceGlassEffects ? 'bg-brand translate-x-6' : 'bg-fg translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Cloud Sync */}
          {currentUser && (
            <div className="bg-surface rounded-md p-5  border border-line">
              <h2 className="text-lg font-bold text-fg mb-4">
                Cloud Sync
              </h2>
              
              <div className="space-y-3">
                {/* Manual Sync */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-sm text-fg">Sync with Cloud Firestore</p>
                    <p className="text-xs text-fg-secondary">Sync data between device and cloud</p>
                  </div>
                  <button
                    onClick={handleSyncToCloud}
                    disabled={syncing}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors flex-shrink-0 flex items-center gap-2 ${
                      synced 
                        ? 'bg-brand text-on-brand cursor-default'
                        : syncing 
                        ? 'bg-fg-muted text-fg cursor-not-allowed'
                        : 'bg-brand hover:bg-brand-hover text-on-brand'
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
                
                {syncSummary && (
                  <div className="bg-bg border border-brand/50 rounded-md p-3 mb-3">
                    <p className="text-xs text-danger-text">
                      Uploaded: {syncSummary.uploaded.watchLater} Watch Later, {syncSummary.uploaded.watched} Watched
                    </p>
                    <p className="text-xs text-danger-text">
                      Downloaded: {syncSummary.downloaded.watchLater} Watch Later, {syncSummary.downloaded.watched} Watched
                    </p>
                    {syncSummary.failures?.length > 0 && (
                      <p className="text-xs text-danger-text mt-1">
                        Failed: {syncSummary.failures.join('; ')}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-surface border border-line rounded-md p-3">
                  <p className="text-xs text-fg-secondary">
                    <strong>Logged in as:</strong> {currentUser.email}
                  </p>
                  <p className="text-xs text-fg-secondary mt-1">
                    Sync your local library with Cloud Firestore. Local-only items upload, cloud-only items download, and nothing is automatically deleted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          <div className="bg-surface rounded-md p-5  border border-line">
            <h2 className="text-lg font-bold text-fg mb-4">
              Data Management
            </h2>
            
            <div className="space-y-3">
              {/* Export Data */}
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-sm text-fg">Export Data</p>
                  <p className="text-xs text-fg-secondary">Download backup</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="bg-brand hover:bg-brand-hover text-on-brand px-4 py-2 rounded-md text-sm font-semibold transition-colors flex-shrink-0"
                >
                  Export
                </button>
              </div>

              {/* Import Data */}
              <div className="flex items-center justify-between py-2 border-t border-line">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-sm text-fg">Import Data</p>
                  <p className="text-xs text-fg-secondary">Restore from backup</p>
                </div>
                <label className="bg-brand hover:bg-brand-hover text-on-brand px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer flex-shrink-0">
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
              <div className="flex items-center justify-between py-2 border-t border-line">
                <div className="flex-1 pr-4">
                  <p className="font-semibold text-sm text-fg">Clear All Data</p>
                  <p className="text-xs text-fg-secondary">Remove all local data. This cannot be undone.</p>
                </div>
                {showConfirm ? (
                  <div className="flex flex-col items-end gap-2">
                    <input
                      value={confirmText}
                      onChange={(event) => setConfirmText(event.target.value)}
                      placeholder="Type CLEAR ALL"
                      aria-label="Type CLEAR ALL to confirm"
                      className="w-36 rounded-md border border-brand-hover bg-bg px-2 py-2 text-xs text-fg"
                    />
                    <button
                      onClick={handleClearData}
                      disabled={confirmText !== 'CLEAR ALL'}
                      className="px-4 py-2 rounded-md text-sm font-semibold bg-danger hover:bg-danger text-on-danger disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Permanently Clear
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-2 rounded-md text-sm font-semibold border border-danger text-danger-text hover:bg-danger/10"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-surface rounded-md p-5  border border-line">
            <h2 className="text-lg font-bold text-fg mb-4">
              About {APP_NAME}
            </h2>
            <div className="grid grid-cols-3 gap-3 text-sm text-fg-secondary">
              <div>
                <p className="text-xs text-fg-secondary">Version</p>
                <p className="font-semibold">1.0.0</p>
              </div>
              <div>
                <p className="text-xs text-fg-secondary">Author</p>
                <p className="font-semibold">Talha Mumtaz</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
