/**
 * CommandPalette — searchable command palette (Ctrl+K).
 * Stub at Level 1; wired to real commands in later levels.
 */

import * as React from 'react';
import { Search, Keyboard } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: Array<CommandItem>;
}

export function CommandPalette({
  open,
  onClose,
  items,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState('');

  const filtered = items.filter(
    (item) =>
      !query ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(query.toLowerCase()),
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center" aria-modal="true" role="dialog" aria-label="Command palette">
      {/* Scrim */}
      <button onClick={onClose} className="absolute inset-0 bg-scrim" aria-hidden="true" />
      <div className="relative z-[901] w-full max-w-lg rounded-3xl bg-glass-deep border border-glass-border shadow-3 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-glass-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" aria-hidden="true" />
            <input
              type="text"
              autoFocus
              placeholder="Search commands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent text-foreground outline-none"
              aria-label="Search commands"
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-foreground-muted">
              No commands found
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                className="flex items-center justify-between w-full px-6 py-3 text-sm transition-colors hover:bg-glass-surface/50"
              >
                <div className="flex items-center gap-3">
                  <Keyboard className="w-3 h-3 text-foreground-muted" aria-hidden="true" />
                  <div>
                    <div className="text-foreground font-medium">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-xs text-foreground-muted">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-foreground-muted bg-glass-surface/50 rounded px-2 py-0.5">
                    {item.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
