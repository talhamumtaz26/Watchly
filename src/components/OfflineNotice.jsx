import React, { useEffect, useState } from 'react';

export default function OfflineNotice() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [reconnected, setReconnected] = useState(false);
  useEffect(() => {
    const disconnected = () => { setOffline(true); setReconnected(false); };
    const connected = () => { setOffline(false); setReconnected(true); };
    window.addEventListener('offline', disconnected);
    window.addEventListener('online', connected);
    return () => {
      window.removeEventListener('offline', disconnected);
      window.removeEventListener('online', connected);
    };
  }, []);
  if (!offline && !reconnected) return null;
  return <div role="status" className="bg-surface text-fg px-4 py-3 text-sm text-center">
    {offline ? 'You’re offline. Connect to the internet to load movie data.' : 'Connection restored.'}
    {!offline && <button className="ml-3 underline min-h-11 px-3" onClick={() => window.location.reload()}>Reload</button>}
  </div>;
}