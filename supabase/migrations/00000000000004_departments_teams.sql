-- 00000000000004_departments_teams.sql
-- Departments (hierarchical via ltree), teams, team_members.

-- =====================================================================
-- departments — hierarchical within an organization using ltree path.
-- =====================================================================
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  parent_id uuid references public.departments(id) on delete set null,
  path ltree not null,
  name text not null,
  head_id uuid references public.profiles(id),
  color text, -- department accent color
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz
);

alter table public.departments enable row level security;

create index idx_departments_org on public.departments(org_id);
create index idx_departments_path on public.departments(path);
create index idx_departments_parent on public.departments(parent_id);
create index idx_departments_head on public.departments(head_id);

-- =====================================================================
-- teams — within an organization, optionally tied to a department.
-- =====================================================================
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  lead_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz
);

alter table public.teams enable row level security;

create index idx_teams_org on public.teams(org_id);
create index idx_teams_department on public.teams(department_id);

-- =====================================================================
-- team_members — many-to-many between profiles and teams.
-- =====================================================================
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  unique(team_id, user_id)
);

alter table public.team_members enable row level security;

create index idx_team_members_team on public.team_members(team_id);
create index idx_team_members_user on public.team_members(user_id);

-- Triggers for updated_at
create trigger update_departments_updated_at before update on public.departments
  for each row execute function public.update_updated_at_column();
create trigger update_teams_updated_at before update on public.teams
  for each row execute function public.update_updated_at_column();

comment on table public.departments is 'Hierarchical department within an organization (ltree path).';
comment on table public.teams is 'Team within an organization.';
comment on table public.team_members is 'Join table between teams and members.';
