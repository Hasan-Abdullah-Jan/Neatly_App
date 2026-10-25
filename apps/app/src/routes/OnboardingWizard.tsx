/**
 * OnboardingWizard — Level 2 onboarding.
 *
 * (a) "Just me / my home" → personal organization, Home profile,
 *     one member, simplified interface.
 * (b) "My organization" → name, profile type, size, locations,
 *     timezone → creates org + applies skeleton Pack.
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Card, Button, Segmented, Stepper, TextField, Select } from '@neatly/ui';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const PROFILES = [
  { key: 'personal', label: 'Personal (home / apartment)' },
  { key: 'small_business', label: 'Small business or office' },
  { key: 'restaurant', label: 'Restaurant or café' },
  { key: 'school', label: 'School or university' },
  { key: 'hospital', label: 'Hospital or clinic' },
  { key: 'public_space', label: 'Public space (park, road, building)' },
  { key: 'custom', label: 'Custom' },
] as const;

const SIZES = [
  { key: '1-10', label: '1–10 people' },
  { key: '11-50', label: '11–50 people' },
  { key: '51-200', label: '51–200 people' },
  { key: '201+', label: '200+ people' },
] as const;

interface WizardState {
  step: 'mode' | 'personal' | 'organization' | 'review' | 'done';
  mode: 'personal' | 'organization' | null;
  orgName: string;
  profile: string;
  size: string;
  locationCount: number;
  timezone: string;
}

const INITIAL_STATE: WizardState = {
  step: 'mode',
  mode: null,
  orgName: '',
  profile: 'custom',
  size: '1-10',
  locationCount: 1,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [state, setState] = React.useState<WizardState>(INITIAL_STATE);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);



  const next = (partial: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...partial }));
  };
  const back = () => {
    const order = ['mode', 'personal', 'organization', 'review', 'done'];
    const idx = order.indexOf(state.step);
    if (idx > 0) setState((s) => ({ ...s, step: order[idx - 1] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (state.mode === 'personal') {
        await createPersonalOrg();
      } else {
        await createOrganization();
      }
      setState((s) => ({ ...s, step: 'done' }));
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
      setLoading(false);
    }
  };

  const createPersonalOrg = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create profile
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'Resident',
      created_by: user.id,
    });

    // Create personal organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: "My Home",
        slug: `home-${user.id.slice(0, 8)}`,
        profile: 'personal',
        timezone: state.timezone,
        locale: 'en',
        created_by: user.id,
      })
      .select()
      .single();
    if (orgError) throw orgError;

    // Get resident role template
    const { data: templates } = await supabase
      .from('role_templates')
      .select('*')
      .eq('key', 'resident')
      .single();

    // Create role in org from template
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert({
        org_id: org.id,
        name: templates?.name || 'Resident',
        key: 'resident',
        description: templates?.description || 'Household member',
        is_template: false,
        is_system: false,
        created_by: user.id,
      })
      .select()
      .single();
    if (roleError) throw roleError;

    // Create membership
    await supabase.from('memberships').insert({
      user_id: user.id,
      org_id: org.id,
      role_id: role.id,
      status: 'active',
      scopes: [{ type: 'organization', id: org.id }],
      created_by: user.id,
    });

    // Copy permissions for resident role
    const { data: perms } = await supabase
      .from('permissions')
      .select('id')
      .in('key', templates?.permission_keys || []);

    if (perms?.length) {
      await supabase.from('role_permissions').insert(
        perms.map((p) => ({ role_id: role.id, permission_id: p.id }))
      );
    }

    // Seed org features for personal profile
    await supabase.from('org_features').insert([
      { org_id: org.id, feature_key: 'public_reporting', enabled: false, created_by: user.id },
      { org_id: org.id, feature_key: 'inventory', enabled: false, created_by: user.id },
      { org_id: org.id, feature_key: 'departments', enabled: false, created_by: user.id },
    ]);
  };

  const createOrganization = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: state.orgName,
        slug: state.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        profile: state.profile,
        timezone: state.timezone,
        locale: 'en',
        created_by: user.id,
      })
      .select()
      .single();
    if (orgError) throw orgError;

    // Get role templates for this profile
    const { data: templates } = await supabase
      .from('role_templates')
      .select('*')
      .eq('profile_scope', state.profile === 'custom' ? 'all' : state.profile);

    // Create roles from templates
    for (const template of templates || []) {
      const { data: role } = await supabase
        .from('roles')
        .insert({
          org_id: org.id,
          name: template.name,
          key: template.key,
          description: template.description,
          is_template: true,
          is_system: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (role) {
        const { data: perms } = await supabase
          .from('permissions')
          .select('id')
          .in('key', template.permission_keys);

        if (perms?.length) {
          await supabase.from('role_permissions').insert(
            perms.map((p) => ({ role_id: role.id, permission_id: p.id }))
          );
        }
      }
    }

    // Create owner membership for the user
    const { data: ownerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('org_id', org.id)
      .eq('key', 'owner')
      .single();

    if (ownerRole) {
      await supabase.from('memberships').insert({
        user_id: user.id,
        org_id: org.id,
        role_id: ownerRole.id,
        status: 'active',
        scopes: [{ type: 'organization', id: org.id }],
        created_by: user.id,
      });
    }

    // Seed org features based on profile
    const features = state.profile === 'personal'
      ? [{ feature_key: 'public_reporting', enabled: false }]
      : [
          { feature_key: 'public_reporting', enabled: true },
          { feature_key: 'inventory', enabled: state.profile === 'restaurant' || state.profile === 'hospital' },
          { feature_key: 'departments', enabled: true },
        ];

    await supabase.from('org_features').insert(
      features.map((f) => ({ org_id: org.id, ...f, created_by: user.id }))
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card padding="lg" className="animate-fade-in">
        {state.step === 'mode' && (
          <>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to Neatly</h2>
            <p className="text-sm text-foreground-secondary mb-6">
              Who is this space for? This determines your profile and default setup.
            </p>
            <Segmented
              value={state.mode ?? 'personal'}
              onValueChange={(v) => next({ mode: v as any })}
              options={[
                { value: 'personal', label: 'Just me / my home' },
                { value: 'organization', label: 'My organization' },
              ]}
            />
            <div className="mt-8 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => next({ step: state.mode === 'personal' ? 'personal' : 'organization' })}>
                Continue
              </Button>
            </div>
          </>
        )}

        {state.step === 'personal' && (
          <>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your Home</h2>
            <p className="text-sm text-foreground-secondary mb-6">
              Set up a personal organization for your home or apartment.
            </p>
            <TextField label="Home name" defaultValue="My Home" />
            <Select label="Timezone">
              {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </Select>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={back}>Back</Button>
              <Button onClick={handleSubmit} loading={loading}>Create Home</Button>
            </div>
          </>
        )}

        {state.step === 'organization' && (
          <>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your Organization</h2>
            <p className="text-sm text-foreground-secondary mb-6">
              We'll set up departments, roles, and defaults based on your profile.
            </p>
            <TextField label="Organization name" value={state.orgName} onChange={(e) => next({ orgName: e.target.value })} />
            <Select label="Profile type" value={state.profile} onChange={(e) => next({ profile: e.target.value })}>
              {PROFILES.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </Select>
            <Select label="Organization size" value={state.size} onChange={(e) => next({ size: e.target.value })}>
              {SIZES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </Select>
            <Stepper label="Number of locations" value={state.locationCount} min={1} max={20} onChange={(updater) => next({ locationCount: updater(state.locationCount) })} />
            <TextField label="Timezone" value={state.timezone} onChange={(e) => next({ timezone: e.target.value })} />
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={back}>Back</Button>
              <Button onClick={handleSubmit} loading={loading} disabled={!state.orgName}>Create Organization</Button>
            </div>
          </>
        )}

        {state.step === 'review' && (
          <>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Review</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Mode</span><span>{state.mode}</span></div>
              {state.mode === 'organization' && (
                <>
                  <div className="flex justify-between"><span>Name</span><span>{state.orgName}</span></div>
                  <div className="flex justify-between"><span>Profile</span><span>{state.profile}</span></div>
                  <div className="flex justify-between"><span>Locations</span><span>{state.locationCount}</span></div>
                </>
              )}
              <div className="flex justify-between"><span>Timezone</span><span>{state.timezone}</span></div>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={back}>Back</Button>
              <Button onClick={handleSubmit} loading={loading}>Create</Button>
            </div>
          </>
        )}

        {state.step === 'done' && (
          <>
            <h2 className="text-2xl font-semibold text-foreground mb-2">You're all set</h2>
            <p className="text-sm text-foreground-secondary mb-6">
              Your organization is ready. You'll find departments, roles, and defaults
              configured for your profile.
            </p>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => navigate('/')}>Go to Home</Button>
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
}
