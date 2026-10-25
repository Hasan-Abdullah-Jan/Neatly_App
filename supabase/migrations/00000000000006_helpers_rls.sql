-- 00000000000006_helpers_rls.sql
-- SQL helper functions and RLS policies for authorization.
-- Helper pattern: app.is_member(org), app.has_perm(org, perm, space?),
-- app.visible_spaces(org), app.clearance(org).

-- ---------------------------------------------------------------------
-- app.current_user_id() — returns the authenticated user's profile id,
-- or null for anonymous/unauthenticated requests.
-- ---------------------------------------------------------------------
create or replace function app.current_user_id() returns uuid as $$
declare
  uid uuid;
begin
  select auth.uid() into uid;
  return uid;
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------
-- app.current_profile_id() — alias for current_user_id (profiles.id == auth.users.id).
-- ---------------------------------------------------------------------
create or replace function app.current_profile_id() returns uuid as $$
declare
  pid uuid;
begin
  select auth.uid() into pid;
  return pid;
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------
-- app.is_member(org_id) — true if the current user has an active
-- membership in the given organization.
-- ---------------------------------------------------------------------
create or replace function app.is_member(target_org_id uuid) returns boolean as $$
declare
  cnt int;
begin
  select count(*) into cnt
  from public.memberships m
  where m.org_id = target_org_id
    and m.user_id = app.current_profile_id()
    and m.status = 'active'
    and m.deleted_at is null;
  return cnt > 0;
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------
-- app.my_memberships() — returns the set of active memberships for the
-- current user (org_id, role_id, scopes).
-- ---------------------------------------------------------------------
create or replace function app.my_memberships() returns table (
  org_id uuid,
  role_id uuid,
  scopes jsonb
) as $$
begin
  return query
  select m.org_id, m.role_id, m.scopes
  from public.memberships m
  where m.user_id = app.current_profile_id()
    and m.status = 'active'
    and m.deleted_at is null;
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------
-- app.has_perm(org_id, perm_key, space_id?) — true if the current user
-- has the given permission in the organization, optionally scoped to a
-- specific space (department/location/space subtree).
-- ---------------------------------------------------------------------
create or replace function app.has_perm(
  target_org_id uuid,
  perm_key text,
  target_space_id uuid default null
) returns boolean as $$
declare
  cnt int;
begin
  -- Must be an active member of the org
  if not app.is_member(target_org_id) then
    return false;
  end if;

  -- Check if any of the user's roles in this org grant the permission
  select count(*) into cnt
  from public.memberships m
  join public.role_permissions rp on rp.role_id = m.role_id
  join public.permissions p on p.id = rp.permission_id
  where m.org_id = target_org_id
    and m.user_id = app.current_profile_id()
    and m.status = 'active'
    and m.deleted_at is null
    and p.key = perm_key
    and p.deleted_at is null;

  if cnt = 0 then
    return false;
  end if;

  -- If a target space is given, check scope membership.
  -- Scopes: [{type: 'organization'|'location'|'department'|'space', id: uuid}]
  -- 'organization' scope grants access to everything in the org.
  if target_space_id is not null then
    select count(*) into cnt
    from public.memberships m
    join public.role_permissions rp on rp.role_id = m.role_id
    join public.permissions p on p.id = rp.permission_id
    where m.org_id = target_org_id
      and m.user_id = app.current_profile_id()
      and m.status = 'active'
      and m.deleted_at is null
      and p.key = perm_key
      and exists (
        select 1 from jsonb_array_elements(m.scopes) as s(scope)
        where (scope->>'type') = 'organization'
           or (scope->>'type') = 'space' and (scope->>'id')::uuid = target_space_id
      );
    return cnt > 0;
  end if;

  return true;
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------
-- app.visible_spaces(org_id) — returns set of space ids the current user
-- can view in the organization (based on role scopes).
-- ---------------------------------------------------------------------
create or replace function app.visible_spaces(target_org_id uuid)
returns table (space_id uuid) as $$
begin
  if not app.is_member(target_org_id) then
    return;
  end if;

  return query
  select distinct (s.scope->>'id')::uuid as space_id
  from public.memberships m,
       jsonb_array_elements(m.scopes) as s(scope)
  where m.org_id = target_org_id
    and m.user_id = app.current_profile_id()
    and m.status = 'active'
    and m.deleted_at is null
    and (s.scope->>'type') in ('organization','space');
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------
-- app.clearance(org_id) — returns set of confidentiality class strings
-- the current user may read in the organization.
-- ---------------------------------------------------------------------
create or replace function app.clearance(target_org_id uuid)
returns table (class text) as $$
begin
  if not app.is_member(target_org_id) then
    return;
  end if;

  return query
  select distinct p.confidential_class
  from public.memberships m
  join public.role_permissions rp on rp.role_id = m.role_id
  join public.permissions p on p.id = rp.permission_id
  where m.org_id = target_org_id
    and m.user_id = app.current_profile_id()
    and m.status = 'active'
    and m.deleted_at is null
    and p.confidential_class is not null;
end;
$$ language plpgsql stable;

-- ---------------------------------------------------------------------
-- RLS POLICIES
-- ---------------------------------------------------------------------

-- profiles: users can read their own profile; org members can read
-- profiles of members in their org (for directory); admins can manage.
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_select_org_members on public.profiles
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.status = 'active'
        and m.deleted_at is null
        and exists (
          select 1 from public.memberships m2
          where m2.user_id = profiles.id
            and m2.org_id = m.org_id
            and m2.status = 'active'
            and m2.deleted_at is null
        )
    )
  );
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- organizations: members can read their orgs; only admins can manage.
create policy organizations_select_member on public.organizations
  for select using (app.is_member(id));
create policy organizations_insert_owner on public.organizations
  for insert with check (auth.uid() = created_by);
create policy organizations_update_admin on public.organizations
  for update using (
    app.has_perm(id, 'org.manage')
  );

-- org_features: members can read; admins can manage.
create policy org_features_select_member on public.org_features
  for select using (app.is_member(org_id));
create policy org_features_manage_admin on public.org_features
  for all using (app.has_perm(org_id, 'org.manage'));

-- memberships: members can read memberships in their org; only admins/roles.manage can write.
create policy memberships_select_member on public.memberships
  for select using (app.is_member(org_id));
create policy memberships_manage_admin on public.memberships
  for all using (app.has_perm(org_id, 'roles.manage'));

-- roles: members can read roles in their org; admins manage.
create policy roles_select_member on public.roles
  for select using (app.is_member(org_id));
create policy roles_manage_admin on public.roles
  for all using (app.has_perm(org_id, 'roles.manage'));

-- permissions: everyone (authenticated) can read the catalog.
create policy permissions_select_auth on public.permissions
  for select using (auth.uid() is not null);

-- role_permissions: members can read; admins manage.
create policy role_permissions_select_member on public.role_permissions
  for select using (
    exists (
      select 1 from public.roles r
      where r.id = role_permissions.role_id
        and app.is_member(r.org_id)
    )
  );
create policy role_permissions_manage_admin on public.role_permissions
  for all using (
    exists (
      select 1 from public.roles r
      where r.id = role_permissions.role_id
        and app.has_perm(r.org_id, 'roles.manage')
    )
  );

-- departments: members can read; dept manage permission to write.
create policy departments_select_member on public.departments
  for select using (app.is_member(org_id));
create policy departments_manage on public.departments
  for all using (app.has_perm(org_id, 'departments.manage'));

-- teams: members can read; dept manage permission to write.
create policy teams_select_member on public.teams
  for select using (app.is_member(org_id));
create policy teams_manage on public.teams
  for all using (app.has_perm(org_id, 'departments.manage'));

-- team_members: members can read; manage via departments.manage.
create policy team_members_select_member on public.team_members
  for select using (
    exists (
      select 1 from public.teams t
      where t.id = team_members.team_id
        and app.is_member(t.org_id)
    )
  );
create policy team_members_manage on public.team_members
  for all using (
    exists (
      select 1 from public.teams t
      where t.id = team_members.team_id
        and app.has_perm(t.org_id, 'departments.manage')
    )
  );

-- invitations: org members can read; roles.manage to create/manage.
create policy invitations_select_member on public.invitations
  for select using (app.is_member(org_id));
create policy invitations_manage on public.invitations
  for all using (app.has_perm(org_id, 'roles.manage'));

-- devices: users can read/manage their own devices.
create policy devices_select_own on public.devices
  for select using (auth.uid() = user_id);
create policy devices_insert_own on public.devices
  for insert with check (auth.uid() = user_id);
create policy devices_update_own on public.devices
  for update using (auth.uid() = user_id);
create policy devices_delete_own on public.devices
  for delete using (auth.uid() = user_id);

-- audit_log: members can read their org's audit; only system writes.
create policy audit_log_select_member on public.audit_log
  for select using (
    org_id is null or app.is_member(org_id)
  );
-- audit_log is append-only via triggers; no client insert/update/delete
create policy audit_log_no_client_write on public.audit_log
  for all using (false);

comment on function app.is_member(uuid) is 'True if current user has an active membership in the org.';
comment on function app.has_perm(uuid, text, uuid) is 'True if current user has the permission in the org (optionally scoped to a space).';
comment on function app.visible_spaces(uuid) is 'Set of space ids visible to current user in the org.';
comment on function app.clearance(uuid) is 'Set of confidentiality classes readable by current user in the org.';
