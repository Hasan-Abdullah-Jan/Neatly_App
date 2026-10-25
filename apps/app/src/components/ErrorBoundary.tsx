/**
 * ErrorBoundary — catches rendering errors and shows a forgiving, non-guilt
 * message with a retry option.
 */

import * as React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true, error: _error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error">
            <span aria-hidden="true">⚠</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Something unexpected happened</h2>
          <p className="mt-2 text-sm text-foreground-secondary max-w-xs">
            We&apos;ll get back on track. Try reloading the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-1 rounded-full border border-glass-border px-3 py-1 text-sm text-foreground-secondary hover:bg-glass-deep"
          >
            <span>Reload</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
