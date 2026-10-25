-- 00000000000002_core_tables.sql
-- Core tenant tables: profiles, organizations, org_features, memberships.
-- Every tenant table has: id, org_id, created_at, updated_at, created_by, deleted_at.
-- RLS is enabled on all of them. Indexes lead with org_id.

-- =====================================================================
-- profiles — one per Supabase Auth user. Not tenant-scoped (global identity),
-- but belongs to exactly one primary organization via memberships.
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  username text unique,
  full_name text,
  avatar_url text,
  color text, -- household/member color for avatar
  locale text default 'en',
  timezone text default 'UTC',
  is_blocked boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz
);

alter table public.profiles enable row level security;

create index idx_profiles_email on public.profiles(email);
create index idx_profiles_phone on public.profiles(phone);
create index idx_profiles_username on public.profiles(username);

-- =====================================================================
-- organizations — the tenant. One row per organization.
-- =====================================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  profile text not null default 'custom', -- personal, small_business, restaurant, school, hospital, public_space, custom
  timezone text not null default 'UTC',
  locale text not null default 'en',
  branding jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb,
  is_demo boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz
);

alter table public.organizations enable row level security;

create index idx_orgs_slug on public.organizations(slug);
create index idx_orgs_profile on public.organizations(profile);
create index idx_orgs_created_by on public.organizations(created_by);

-- =====================================================================
-- org_features — feature flags per organization.
-- =====================================================================
create table public.org_features (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  feature_key text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz,
  unique(org_id, feature_key)
);

alter table public.org_features enable row level security;

create index idx_org_features_org on public.org_features(org_id);
create index idx_org_features_key on public.org_features(feature_key);

-- =====================================================================
-- memberships — links a user to an organization with a role and scopes.
-- Each scope is an organization, location, department or space subtree
-- (represented as org_id or an ltree path).
-- =====================================================================
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  status text not null default 'active', -- active, inactive, invited, left
  scopes jsonb not null default '[]'::jsonb, -- [{type: 'organization'|'location'|'department'|'space', id: uuid}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz,
  unique(user_id, org_id)
);

alter table public.memberships enable row level security;

create index idx_memberships_user on public.memberships(user_id);
create index idx_memberships_org on public.memberships(org_id);
create index idx_memberships_role on public.memberships(role_id);
create index idx_memberships_status on public.memberships(status);

-- =====================================================================
-- Trigger to update updated_at on core tables.
-- =====================================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  for t in (
    select tablename from pg_tables where schemaname = 'public'
      and tablename in ('profiles','organizations','org_features','memberships')
  ) loop
    execute format('
      create trigger update_%I_updated_at before update on public.%I
      for each row execute function public.update_updated_at_column();
    ', t.tablename, t.tablename);
  end loop;
end $$;

comment on table public.profiles is 'Global user profile (one per Supabase Auth user).';
comment on table public.organizations is 'Tenant organization. Row-level security on every access.';
comment on table public.org_features is 'Feature flags per organization.';
comment on table public.memberships is 'Links a user to an organization with a role and scopes.';
