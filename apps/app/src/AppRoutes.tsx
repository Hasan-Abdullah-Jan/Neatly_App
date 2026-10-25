/**
 * AppRoutes — route-level code splitting.
 * Level 1 routes + Level 2 identity/organization routes.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Level 1 routes
const Home = lazy(() => import('./routes/pages').then((m) => ({ default: m.Home })));
const Tasks = lazy(() => import('./routes/pages').then((m) => ({ default: m.Tasks })));
const Workspace = lazy(() => import('./routes/pages').then((m) => ({ default: m.Workspace })));
const Schedule = lazy(() => import('./routes/pages').then((m) => ({ default: m.Schedule })));
const Profile = lazy(() => import('./routes/pages').then((m) => ({ default: m.Profile })));
const NotFound = lazy(() => import('./routes/pages').then((m) => ({ default: m.NotFound })));

// Level 2 routes
const OnboardingWizard = lazy(() => import('./routes/OnboardingWizard').then((m) => ({ default: m.OnboardingWizard })));
const PeoplePage = lazy(() => import('./routes/PeoplePage').then((m) => ({ default: m.PeoplePage })));
const RolesPermissionsEditor = lazy(() => import('./routes/RolesPermissionsEditor').then((m) => ({ default: m.RolesPermissionsEditor })));
const SettingsPage = lazy(() => import('./routes/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const Gallery = lazy(() => import('./routes/Gallery').then((m) => ({ default: m.Gallery })));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <Routes>
        {/* Level 1 */}
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/gallery" element={<Gallery />} />

        {/* Level 2 */}
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/roles" element={<RolesPermissionsEditor />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
