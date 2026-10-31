import { Component, type ReactNode } from 'react';
import { exportBackup } from '../store/data';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6 text-center">
        <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
        <p className="mb-6 text-sm text-muted">Your data is safe on this device. Reloading usually fixes it.</p>
        <div className="flex gap-2">
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-brand-fg" onClick={() => window.location.reload()}>
            Reload
          </button>
          <button
            className="rounded-xl border border-line px-4 py-2 text-sm"
            onClick={() => {
              const url = URL.createObjectURL(new Blob([exportBackup()], { type: 'application/json' }));
              const a = document.createElement('a');
              a.href = url;
              a.download = 'neatly-backup.json';
              a.click();
            }}
          >
            Download my data
          </button>
        </div>
      </div>
    );
  }
}
