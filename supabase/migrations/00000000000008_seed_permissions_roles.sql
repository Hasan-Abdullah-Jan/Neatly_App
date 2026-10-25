-- 00000000000008_seed_permissions_roles.sql
-- Seed: permission catalog and role templates (as listed in 0.9 of the brief).

-- ---------------------------------------------------------------------
-- Permission catalog seed.
-- ---------------------------------------------------------------------
insert into public.permissions (key, description, category, confidential_class) values
  -- Organization
  ('org.manage', 'Manage organization settings, billing, and plan', 'organization', null),
  ('people.manage', 'Invite, deactivate, and manage people in the organization', 'people', null),
  ('roles.manage', 'Create, edit, and assign roles and permissions', 'roles', null),
  ('departments.manage', 'Create, edit, and manage departments', 'organization', null),

  -- Spaces
  ('spaces.view', 'View spaces in the organization', 'spaces', null),
  ('spaces.manage', 'Create, edit, and manage spaces', 'spaces', null),

  -- Assets
  ('assets.manage', 'Create, edit, and manage assets', 'assets', null),

  -- Templates
  ('templates.manage', 'Create, edit, and manage task templates', 'templates', null),

  -- Schedules
  ('schedules.manage', 'Create, edit, and manage schedules', 'schedules', null),

  -- Tasks
  ('tasks.view.own', 'View tasks assigned to oneself', 'tasks', null),
  ('tasks.view.team', 'View tasks assigned to one''s team', 'tasks', null),
  ('tasks.view.all', 'View all tasks in the organization', 'tasks', null),
  ('tasks.assign', 'Assign tasks to other people', 'tasks', null),
  ('tasks.execute', 'Execute (perform) tasks', 'tasks', null),
  ('tasks.verify', 'Verify completed tasks', 'tasks', null),
  ('tasks.reopen', 'Reopen verified tasks', 'tasks', null),

  -- Cases
  ('cases.create', 'Create cases/reports', 'cases', null),
  ('cases.view.own', 'View cases one created', 'cases', null),
  ('cases.view.department', 'View cases in one''s department', 'cases', null),
  ('cases.view.all', 'View all cases in the organization', 'cases', null),
  ('cases.view.confidential.security', 'View security-classified cases', 'cases', 'security'),
  ('cases.view.confidential.conduct', 'View conduct-classified cases', 'cases', 'conduct'),
  ('cases.view.confidential.patient', 'View patient-classified cases', 'cases', 'patient'),
  ('cases.assign', 'Assign cases to other people', 'cases', null),
  ('cases.resolve', 'Resolve cases', 'cases', null),
  ('cases.verify', 'Verify case resolutions', 'cases', null),
  ('cases.close', 'Close cases', 'cases', null),

  -- Requests
  ('requests.create', 'Create requests for repair/supplies/help', 'requests', null),
  ('requests.approve', 'Approve requests', 'requests', null),
  ('requests.fulfil', 'Fulfil approved requests', 'requests', null),

  -- Inventory
  ('inventory.view', 'View inventory levels', 'inventory', null),
  ('inventory.adjust', 'Adjust inventory levels', 'inventory', null),
  ('inventory.purchase', 'Purchase inventory', 'inventory', null),

  -- Reports
  ('reports.view.org', 'View organization-wide reports', 'reports', null),
  ('reports.view.staff', 'View staff reports', 'reports', null),

  -- Feedback
  ('feedback.view', 'View visitor feedback', 'feedback', null),
  ('feedback.respond', 'Respond to visitor feedback', 'feedback', null),

  -- Routing
  ('routing.manage', 'Manage case/report routing rules', 'routing', null),

  -- Standards
  ('standards.manage', 'Manage quality standards', 'standards', null),

  -- Goals
  ('goals.manage', 'Manage goals and care rhythms', 'goals', null),

  -- Public page
  ('publicpage.manage', 'Manage public status page and QR reporting', 'public', null),

  -- Audit
  ('audit.view', 'View audit log', 'audit', null),

  -- Data
  ('data.export', 'Export organization data', 'data', null)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Role templates seed (as listed in 0.9).
-- These are inserted into each organization during onboarding as
-- editable presets. Here we seed them into a placeholder; onboarding
-- will copy templates into new orgs.
-- ---------------------------------------------------------------------

-- We'll create a seed roles table that onboarding copies from.
-- For now, define the template definitions as data that onboarding reads.
-- Create a seed reference table for role templates.
create table public.role_templates (
  key text primary key,
  name text not null,
  description text,
  is_system boolean default true,
  profile_scope text default 'all', -- personal, small_business, restaurant, school, hospital, public_space, all
  permission_keys text[] not null default '{}',
  confidential_classes text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.role_templates enable row level security;
create policy role_templates_select_auth on public.role_templates
  for select using (auth.uid() is not null);

insert into public.role_templates (key, name, description, profile_scope, permission_keys, confidential_classes) values
  -- Owner
  ('owner', 'Owner', 'Full control over the organization. Can manage billing, delete the org, and assign any role.', 'all',
   array['org.manage','people.manage','roles.manage','departments.manage','spaces.view','spaces.manage','assets.manage',
         'templates.manage','schedules.manage','tasks.view.all','tasks.assign','tasks.execute','tasks.verify','tasks.reopen',
         'cases.create','cases.view.all','cases.assign','cases.resolve','cases.verify','cases.close',
         'requests.create','requests.approve','requests.fulfil','inventory.view','inventory.adjust','inventory.purchase',
         'reports.view.org','reports.view.staff','feedback.view','feedback.respond','routing.manage','standards.manage',
         'goals.manage','publicpage.manage','audit.view','data.export'],
   array['security','conduct','patient']),
  -- Administrator
  ('administrator', 'Administrator', 'Nearly full control. Can manage most settings and people, but cannot delete the organization.', 'all',
   array['people.manage','roles.manage','departments.manage','spaces.view','spaces.manage','assets.manage',
         'templates.manage','schedules.manage','tasks.view.all','tasks.assign','tasks.execute','tasks.verify','tasks.reopen',
         'cases.create','cases.view.all','cases.assign','cases.resolve','cases.verify','cases.close',
         'requests.create','requests.approve','requests.fulfil','inventory.view','inventory.adjust','inventory.purchase',
         'reports.view.org','reports.view.staff','feedback.view','feedback.respond','routing.manage','standards.manage',
         'goals.manage','publicpage.manage','audit.view','data.export'],
   array[]::text[]), -- confidential classes only when explicitly granted
  -- Manager
  ('manager', 'Manager', 'Manages day-to-day operations within their scope. Can view all org data but confidential classes require explicit grant.', 'all',
   array['spaces.view','spaces.manage','assets.manage','templates.manage','schedules.manage','tasks.view.team','tasks.assign',
         'tasks.execute','tasks.verify','tasks.reopen','cases.create','cases.view.department','cases.assign','cases.resolve',
         'cases.verify','cases.close','requests.create','requests.approve','requests.fulfil','inventory.view','inventory.adjust',
         'feedback.view','feedback.respond','goals.manage'],
   array[]::text[]),
  -- Department Supervisor
  ('department_supervisor', 'Department Supervisor', 'Supervises a specific department and its spaces/tasks/cases.', 'all',
   array['spaces.view','tasks.view.team','tasks.assign','tasks.execute','tasks.verify','tasks.reopen',
         'cases.create','cases.view.department','cases.assign','cases.resolve','cases.verify','cases.close',
         'requests.create','requests.approve','requests.fulfil','inventory.view','feedback.view'],
   array[]::text[]),
  -- Cleaner
  ('cleaner', 'Cleaner', 'Executes cleaning tasks in assigned spaces. No confidential-case access by default.', 'all',
   array['tasks.view.team','tasks.execute','tasks.verify','requests.create'],
   array[]::text[]),
  -- Maintenance Worker
  ('maintenance_worker', 'Maintenance Worker', 'Executes maintenance and repair tasks.', 'all',
   array['tasks.view.team','tasks.execute','tasks.verify','requests.create','requests.fulfil'],
   array[]::text[]),
  -- Gardener
  ('gardener', 'Gardener', 'Executes gardening and outdoor tasks. No confidential-case access by default.', 'all',
   array['tasks.view.team','tasks.execute','tasks.verify'],
   array[]::text[]),
  -- Security Guard
  ('security_guard', 'Security Guard', 'Security patrols and incident reporting. Receives security confidential class by default.', 'all',
   array['cases.create','cases.view.all','cases.assign','cases.resolve','feedback.view'],
   array['security']),
  -- Receptionist / Attendant
  ('receptionist', 'Receptionist / Attendant', 'Front-desk duties, visitor management, and basic case intake.', 'all',
   array['cases.create','cases.view.own','requests.create','feedback.view','feedback.respond'],
   array[]::text[]),
  -- Pharmacist
  ('pharmacist', 'Pharmacist', 'Pharmacy-specific duties. Receives patient confidential class in hospital profiles.', 'hospital',
   array['cases.view.department','inventory.view','inventory.adjust'],
   array['patient']),
  -- Resident
  ('resident', 'Resident', 'Household member in a personal organization. Limited to own spaces and tasks.', 'personal',
   array['spaces.view','tasks.view.own','tasks.execute','cases.create','cases.view.own','requests.create'],
   array[]::text[]),
  -- Viewer
  ('viewer', 'Viewer', 'Read-only access to organization data.', 'all',
   array['spaces.view','tasks.view.own','cases.view.own','inventory.view','feedback.view'],
   array[]::text[])
on conflict (key) do nothing;

-- Index for template lookups by profile.
create index idx_role_templates_profile on public.role_templates(profile_scope);

comment on table public.role_templates is 'Seed role template definitions copied into new organizations during onboarding.';
