/**
 * App — top-level shell.
 *
 * Wraps the router with the ambient background, time-of-day tint, dock/side
 * rail, page transitions, error boundary, and offline banner.
 */

import { useEffect } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { TimeOfDayTint } from './components/TimeOfDayTint';
import { OfflineBanner } from './components/OfflineBanner';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRoutes } from './AppRoutes';

export function App() {
  // Pause ambient background when tab hidden; resume on focus.
  useEffect(() => {
    const handler = () => {
      document.documentElement.style.setProperty(
        '--ambient-paused',
        document.hidden ? '1' : '0',
      );
    };
    document.addEventListener('visibilitychange', handler);
    handler();
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen overflow-hidden relative">
        {/* Ambient background (drifting gradient shapes) */}
        <AmbientBackground />

        {/* Time-of-day tint overlay */}
        <TimeOfDayTint />

        {/* Routes inside the shell (shell provides dock/sidebar) */}
        <AppShell>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AppShell>

        {/* Offline banner stub */}
        <OfflineBanner />
      </div>
    </ErrorBoundary>
  );
}
