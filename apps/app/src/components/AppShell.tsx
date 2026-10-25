/**
 * AppShell — dock on phones, glass side rail from 1024px.
 * Contains the navigation dock / side rail and the content area.
 */

import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { FloatingDock } from '@neatly/ui';
import { Home, CheckSquare, Layout, Calendar, User } from 'lucide-react';

const NAV_ITEMS: Array<{
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
}> = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'tasks', label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { key: 'workspace', label: 'Workspace', href: '/workspace', icon: Layout },
  { key: 'schedule', label: 'Schedule', href: '/schedule', icon: Calendar },
  { key: 'profile', label: 'Profile', href: '/profile', icon: User },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();

  return (
    <div className="flex flex-1 h-full relative">
      {/* Side rail (desktop, 1024px+) */}
      <nav className="hidden md:flex flex-col w-20 border-r border-glass-border bg-glass-surface/95 backdrop-blur-md z-20">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.href;
          return (
            <button
              key={item.key}
              aria-pressed={active}
              aria-label={item.label}
              className={`flex items-center justify-center w-10 h-10 rounded-full mx-2 transition-colors ${
                active
                  ? 'bg-liquid-blue text-inverse shadow-sm'
                  : 'text-foreground-muted hover:bg-glass-surface/50 hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      {/* Content area */}
      <main className="flex-1 h-full overflow-y-auto bg-background relative">
        {children}
      </main>

      {/* Floating dock (phones, below 1024px) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <FloatingDock
          activeKey={location.pathname.slice(1) || 'home'}
          onSelect={(key: string) => {
            const item = NAV_ITEMS.find((i) => i.key === key);
            if (item) {
              window.location.href = item.href;
            }
          }}
        />
      </div>
    </div>
  );
}
