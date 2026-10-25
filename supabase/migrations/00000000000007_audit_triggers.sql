-- 00000000000007_audit_triggers.sql
-- Append-only audit log triggers on sensitive tables.
-- Triggers fire AFTER INSERT/UPDATE/DELETE and write to audit_log.
-- Clients never write audit_log directly.

-- Helper: audit_write() trigger function.
create or replace function app.audit_write() returns trigger as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_action text;
begin
  if tg_op = 'DELETE' then
    v_action := 'delete';
    v_old := to_jsonb(old);
    v_new := null;
  elsif tg_op = 'INSERT' then
    v_action := 'insert';
    v_old := null;
    v_new := to_jsonb(new);
  else -- UPDATE
    v_action := 'update';
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
  end if;

  insert into public.audit_log (
    org_id, user_id, action, table_name, row_id,
    old_values, new_values, created_by
  ) values (
    coalesce((v_new->>'org_id')::uuid, (v_old->>'org_id')::uuid),
    app.current_profile_id(),
    v_action,
    tg_table_name,
    coalesce((v_new->>'id')::uuid, (v_old->>'id')::uuid),
    v_old,
    v_new,
    app.current_profile_id()
  );

  -- Triggers on audit_log itself must not recurse.
  if tg_table_name = 'audit_log' then
    return null;
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$ language plpgsql security definer;

-- Attach audit triggers to sensitive tables.
do $$
declare
  tables_to_audit text[] := array[
    'organizations','memberships','roles','role_permissions',
    'permissions','departments','teams','invitations','devices','profiles'
  ];
  t text;
begin
  foreach t in array tables_to_audit loop
    execute format('
      drop trigger if exists audit_%I on public.%I;
      create trigger audit_%I
        after insert or update or delete on public.%I
        for each row execute function app.audit_write();
    ', t, t, t, t);
  end loop;
end $$;

-- Protect audit_log: trigger-written only, never client-modifiable.
-- (Already enforced by RLS policy audit_log_no_client_write = false above.)

comment on function app.audit_write() is 'Append-only audit trigger. Writes to audit_log on every change to sensitive tables.';
