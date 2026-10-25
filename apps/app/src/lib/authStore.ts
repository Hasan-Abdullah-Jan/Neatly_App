/**
 * Auth-related Zustand store (lightweight; auth state lives in Supabase).
 * Tracks current profile, memberships, and active organization.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Membership {
  id: string;
  user_id: string;
  org_id: string;
  role_id: string;
  role_key?: string;
  role_name?: string;
  status: string;
  scopes: Array<{ type: string; id: string }>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  profile: string;
  timezone: string;
  locale: string;
}

interface AuthState {
  profile: any | null;
  memberships: Membership[];
  organizations: Organization[];
  activeOrgId: string | null;
  setProfile: (profile: any | null) => void;
  setMemberships: (memberships: Membership[]) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setActiveOrg: (orgId: string | null) => void;
  addMembership: (membership: Membership) => void;
  removeMembership: (orgId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      memberships: [],
      organizations: [],
      activeOrgId: null,
      setProfile: (profile) => set({ profile }),
      setMemberships: (memberships) => set({ memberships }),
      setOrganizations: (organizations) => set({ organizations }),
      setActiveOrg: (orgId) => set({ activeOrgId: orgId }),
      addMembership: (membership) =>
        set((state) => ({
          memberships: [...state.memberships.filter(m => m.org_id !== membership.org_id), membership],
        })),
      removeMembership: (orgId) =>
        set((state) => ({
          memberships: state.memberships.filter(m => m.org_id !== orgId),
          activeOrgId: state.activeOrgId === orgId ? null : state.activeOrgId,
        })),
    }),
    { name: 'neatly-auth' }
  )
);
