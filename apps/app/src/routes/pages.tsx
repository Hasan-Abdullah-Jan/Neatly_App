/**
 * Route components — placeholder pages for Level 1 shell.
 * Business features are out of scope at Level 1; these are navigational shells.
 */

import { Card, EmptyState, GlassSurface, StatCounter, ProgressOrb } from '@neatly/ui';

export function Home() {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  if (hour >= 17 && hour < 21) greeting = 'Good evening';
  if (hour >= 21 || hour < 5) greeting = 'Good night';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-foreground-secondary">
            Your space is clear. Add something whenever you&apos;re ready.
          </p>
        </div>
        <ProgressOrb value={0} label="No tasks today" size="lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCounter value={0} label="Tasks today" suffix="" />
        <StatCounter value={0} label="Spaces" />
        <StatCounter value={0} label="Cases" />
      </div>

      <Card padding="base">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Up next</h2>
            <p className="text-sm text-foreground-secondary">
              Nothing scheduled yet. Create your first task from the dock.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 rounded-xl border border-glass-border bg-glass-surface text-sm text-foreground hover:bg-glass-deep">
              Add task
            </button>
            <button className="px-4 py-2 rounded-xl bg-liquid-blue text-inverse text-sm font-medium hover:bg-liquid-blue-dim">
              Capture
            </button>
          </div>
        </div>
      </Card>

      <GlassSurface level={1} className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Welcome to Neatly</h3>
        <p className="text-sm text-foreground-secondary">
          This is the Level 1 shell. Business features arrive in later levels.
          Use the dock to navigate between Home, Tasks, Workspace, Schedule, and Profile.
        </p>
      </GlassSurface>
    </div>
  );
}

export function Tasks() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Tasks</h1>
      <EmptyState
        title="No tasks yet"
        description="Your task list is clear. Add a task whenever you&apos;re ready."
        action={
          <button className="px-4 py-2 rounded-xl bg-liquid-blue text-inverse text-sm hover:bg-liquid-blue-dim">
            Add task
          </button>
        }
      />
    </div>
  );
}

export function Workspace() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Workspace</h1>
      <EmptyState
        title="No spaces yet"
        description="Add your first space from the dock."
        action={
          <button className="px-4 py-2 rounded-xl bg-liquid-blue text-inverse text-sm hover:bg-liquid-blue-dim">
            Add space
          </button>
        }
      />
    </div>
  );
}

export function Schedule() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Schedule</h1>
      <EmptyState
        title="No schedules yet"
        description="Set up recurring tasks from the dock."
        action={
          <button className="px-4 py-2 rounded-xl bg-liquid-blue text-inverse text-sm hover:bg-liquid-blue-dim">
            Add schedule
          </button>
        }
      />
    </div>
  );
}

export function Profile() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
      <Card padding="base">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-foreground-secondary">
          Theme, sensory preferences, and accessibility settings appear here.
        </p>
      </Card>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-foreground">Not found</h1>
      <p className="text-sm text-foreground-secondary">
        The page you&apos;re looking for doesn&apos;t exist yet.
      </p>
    </div>
  );
}
