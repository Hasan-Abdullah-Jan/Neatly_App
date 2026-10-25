/**
 * OfflineBanner — stub banner shown when offline.
 * At Level 1 it's a visual stub; wired to real connection status later.
 */

import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[950] px-4 py-2 bg-amber-500/90 text-white text-xs font-medium text-center shadow-1">
      You&apos;re offline. Changes will sync when you&apos;re back online.
    </div>
  );
}
