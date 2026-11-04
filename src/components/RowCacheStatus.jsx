import React, { useEffect, useState } from 'react';

const formatUpdatedTime = (timestamp) => (
  timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'unknown'
);

const RowCacheStatus = ({ lastUpdated, refreshFailed, hasCachedRows, onRetry, offline: offlineProp = false }) => {
  const [offlineState, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const disconnected = () => setOffline(true);
    const connected = () => setOffline(false);
    window.addEventListener('offline', disconnected);
    window.addEventListener('online', connected);
    return () => {
      window.removeEventListener('offline', disconnected);
      window.removeEventListener('online', connected);
    };
  }, []);

  const offline = offlineProp || offlineState;
  if (!offline && !refreshFailed) return null;

  if (offline && !hasCachedRows) {
    return (
      <div role="status" className="mb-6 rounded-md bg-surface px-4 py-4 text-center text-sm text-fg-secondary">
        <p className="mb-3">You&apos;re offline</p>
        <button type="button" onClick={onRetry} className="min-h-11 rounded-md bg-brand px-4 font-semibold text-on-brand hover:bg-brand-hover">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div role="status" className="mb-6 rounded-md bg-surface px-4 py-3 text-center text-sm text-fg-secondary">
      <span>You&apos;re offline, showing saved results</span>
      {lastUpdated ? <span className="ml-2 text-fg-secondary">Last updated {formatUpdatedTime(lastUpdated)}</span> : null}
      {refreshFailed && !offline ? (
        <button type="button" onClick={onRetry} className="ml-3 min-h-11 px-3 font-semibold text-brand-hover underline">
          Retry
        </button>
      ) : null}
    </div>
  );
};

export default RowCacheStatus;
