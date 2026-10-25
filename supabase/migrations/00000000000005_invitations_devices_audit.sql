-- 00000000000005_invitations_devices_audit.sql
-- Invitations (hashed token, role, scopes, expiry), devices, audit_log.

-- =====================================================================
-- invitations — pending membership invites.
-- =====================================================================
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text,
  phone text,
  role_id uuid not null references public.roles(id) on delete restrict,
  scopes jsonb not null default '[]'::jsonb,
  -- hashed token; never stored in plaintext
  token_hash text not null,
  invited_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  deleted_at timestamptz
);

alter table public.invitations enable row level security;

create index idx_invitations_org on public.invitations(org_id);
create index idx_invitations_token on public.invitations(token_hash);
create index idx_invitations_email on public.invitations(email);
create index idx_invitations_expires on public.invitations(expires_at);

-- =====================================================================
-- devices — user device list (for session management).
-- =====================================================================
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_name text,
  device_id text not null, -- client-generated device fingerprint
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_by uuid references public.profiles(id),
  deleted_at timestamptz,
  unique(user_id, device_id)
);

alter table public.devices enable row level security;

create index idx_devices_user on public.devices(user_id);
create index idx_devices_device_id on public.devices(device_id);

-- =====================================================================
-- audit_log — append-only security audit log.
-- Written by triggers on sensitive tables; never directly by clients.
-- =====================================================================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id),
  user_id uuid references public.profiles(id),
  action text not null, -- e.g. role_change, invitation_created, deactivation
  table_name text,
  row_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

alter table public.audit_log enable row level security;

create index idx_audit_log_org on public.audit_log(org_id);
create index idx_audit_log_user on public.audit_log(user_id);
create index idx_audit_log_action on public.audit_log(action);
create index idx_audit_log_created_at on public.audit_log(created_at);

-- Triggers for updated_at
create trigger update_invitations_updated_at before update on public.invitations
  for each row execute function public.update_updated_at_column();
create trigger update_devices_updated_at before update on public.devices
  for each row execute function public.update_updated_at_column();

comment on table public.invitations is 'Pending membership invites with hashed tokens.';
comment on table public.devices is 'User device list for session management.';
comment on table public.audit_log is 'Append-only security audit log (trigger-written, never client-written).';
