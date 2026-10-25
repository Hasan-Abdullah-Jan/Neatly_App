-- 00000000000003_roles_permissions.sql
-- Roles (organization-scoped), permissions (static catalog), role_permissions join.

-- =====================================================================
-- permissions — static catalog of permission keys.
-- =====================================================================
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null, -- e.g. tasks.execute, cases.view.confidential.security
  description text not null,
  category text not null default 'general',
  confidential_class text, -- null unless this permission gates confidential data
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

alter table public.permissions enable row level security;

create index idx_permissions_key on public.permissions(key);
create index idx_permissions_confidential on public.permissions(confidential_class);

-- =====================================================================
-- roles — organization-scoped. System templates flagged with is_template.
-- =====================================================================
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  key text not null, -- e.g. cleaner, security_guard, manager (unique per org)
  description text,
  is_template boolean default false,
  is_system boolean default false, -- system template roles cannot be deleted
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz,
  unique(org_id, key)
);

alter table public.roles enable row level security;

create index idx_roles_org on public.roles(org_id);
create index idx_roles_key on public.roles(key);
create index idx_roles_template on public.roles(is_template);

-- =====================================================================
-- role_permissions — join table.
-- =====================================================================
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(role_id, permission_id)
);

alter table public.role_permissions enable row level security;

create index idx_role_permissions_role on public.role_permissions(role_id);
create index idx_role_permissions_perm on public.role_permissions(permission_id);

-- Triggers for updated_at
create trigger update_roles_updated_at before update on public.roles
  for each row execute function public.update_updated_at_column();

comment on table public.permissions is 'Static catalog of permission keys.';
comment on table public.roles is 'Organization-scoped role. System templates flagged.';
comment on table public.role_permissions is 'Join table mapping roles to permissions.';
