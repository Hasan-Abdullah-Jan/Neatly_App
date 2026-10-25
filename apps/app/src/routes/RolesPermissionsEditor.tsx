/**
 * RolesPermissionsEditor — Level 2 role and permission management.
 * Matrix view, clone template, create custom role, plain-language explainer.
 */

import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, Button, Chip, ListRow, EmptyState, Avatar } from '@neatly/ui';
import { Copy, Plus, Edit2 } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const PERMISSION_GROUPS = {
  organization: ['org.manage', 'people.manage', 'roles.manage', 'departments.manage'],
  spaces: ['spaces.view', 'spaces.manage'],
  tasks: ['tasks.view.own', 'tasks.view.team', 'tasks.view.all', 'tasks.assign', 'tasks.execute', 'tasks.verify', 'tasks.reopen'],
  cases: ['cases.create', 'cases.view.own', 'cases.view.department', 'cases.view.all', 'cases.assign', 'cases.resolve', 'cases.verify', 'cases.close'],
  inventory: ['inventory.view', 'inventory.adjust', 'inventory.purchase'],
  reports: ['reports.view.org', 'reports.view.staff'],
  audit: ['audit.view', 'data.export'],
} as const;

export function RolesPermissionsEditor() {
  const [roles, setRoles] = React.useState<Array<any>>([]);
  const [permissions, setPermissions] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState<any>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [r, p] = await Promise.all([
      supabase.from('roles').select('*').eq('is_system', false),
      supabase.from('permissions').select('*'),
    ]);
    setRoles(r.data || []);
    setPermissions(p.data || []);
    setLoading(false);
  };

  const handleCreateRole = () => {
    const key = prompt('Role key (e.g. floor_supervisor):');
    const name = prompt('Display name:');
    if (!key || !name) return;
    // Would insert via supabase
    console.log('Create role:', { key, name });
  };

  const handleCloneRole = (role: any) => {
    const newKey = prompt(`Clone ${role.name} as (key):`);
    if (!newKey) return;
    console.log('Clone role:', role.key, '→', newKey);
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Roles & Permissions</h1>
          <p className="text-sm text-foreground-secondary">Define who can do what in your organization.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateRole}>
            <Plus className="w-4 h-4 mr-2" /> Create Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <div className="lg:col-span-1">
          <Card padding="base">
            <h3 className="text-sm font-semibold text-foreground mb-4">Roles</h3>
            {roles.length === 0 ? (
              <EmptyState title="No roles" description="Create your first role." />
            ) : (
              <div className="space-y-2">
                {roles.map((role) => (
                  <ListRow
                    key={role.id}
                    leading={<Avatar name={role.name} size="sm" />}
                    trailing={
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRole(role)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCloneRole(role)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    }
                  >
                    {role.name}
                    {role.is_system && <span className="ml-2 text-xs text-foreground-muted">system</span>}
                  </ListRow>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Permission matrix */}
        <div className="lg:col-span-2">
          <Card padding="base">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Permission Matrix {selectedRole && <span className="text-xs text-foreground-muted ml-2">— {selectedRole.name}</span>}
            </h3>
            {selectedRole ? (
              <div className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">{category}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {perms.map((permKey) => {
                        const perm = permissions.find((p) => p.key === permKey);
                        if (!perm) return null;
                        return (
                          <Chip key={permKey} variant={selectedRole.key === 'owner' ? 'filled' : 'outline'} onSelect={() => {}}>
                            {perm.key.split('.').pop()}
                            {perm.confidential_class && (
                              <span className="ml-1 text-[10px] badge-variant">{perm.confidential_class}</span>
                            )}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-glass-border">
                  <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Plain language</h4>
                  <p className="text-sm text-foreground-secondary mt-1">
                    {selectedRole.name} can {selectedRole.key === 'owner' ? 'manage everything in the organization.' : selectedRole.key === 'cleaner' ? 'execute tasks in assigned spaces only.' : 'view and act within their assigned scope.'}
                  </p>
                  {selectedRole.key !== 'cleaner' && selectedRole.key !== 'gardener' && (
                    <p className="text-xs text-foreground-secondary mt-1">
                      No confidential-case permissions by default. Classes must be granted explicitly by an Administrator.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState title="Select a role" description="Choose a role from the list to see its permissions." />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
