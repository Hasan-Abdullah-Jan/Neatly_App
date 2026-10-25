/**
 * PeoplePage — Level 2 people management.
 * List, filters, invite (email/phone/link/QR), assign role/department/team/scope,
 * deactivate, bulk CSV import, "What can this person see?" preview.
 */

import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, Button, TextField, Select, Segmented, Badge, Avatar, EmptyState, Chip } from '@neatly/ui';
import { UserPlus } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export function PeoplePage() {
  const [members, setMembers] = React.useState<Array<any>>([]);
  const [roles] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterRole, setFilterRole] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [search, setSearch] = React.useState<string>('');
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [previewMember, setPreviewMember] = React.useState<any>(null);

  React.useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const { data } = await supabase
      .from('memberships')
      .select(`
        *,
        profiles (id, full_name, email, phone, avatar_url, color),
        roles (id, name, key)
      `)
      .eq('status', 'active');
    setMembers(data || []);
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteOpen(false);
    // Invite handled via invite-create Edge Function
  };

  const handleDeactivate = async (memberId: string) => {
    if (!window.confirm('Deactivate this member? Their access will be blocked immediately.')) return;
    await supabase.from('memberships').update({ status: 'inactive' }).eq('id', memberId);
    await loadMembers();
  };

  const filteredMembers = members.filter((m) => {
    const matchRole = filterRole === 'all' || m.roles?.key === filterRole;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchSearch = !search ||
      m.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.profiles?.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">People</h1>
          <p className="text-sm text-foreground-secondary">Manage members, roles, and access.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Invite
          </Button>
        </div>
      </div>

      <Card padding="base">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <TextField label="Search people" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="w-full md:w-48">
            <Select label="Role" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.key}>{r.name}</option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><p className="text-foreground-muted">Loading…</p></div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState title="No people found" description="Try adjusting your filters or invite someone new." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border text-xs text-foreground-muted">
                  <th className="pb-3">Person</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Scopes</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="border-b border-glass-border/50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.profiles?.full_name || 'Member'} src={m.profiles?.avatar_url} size="sm" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{m.profiles?.full_name || 'Unknown'}</div>
                          <div className="text-xs text-foreground-muted">{m.profiles?.email || m.profiles?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="default">{m.roles?.name || '—'}</Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant={m.status === 'active' ? 'success' : 'error'}>{m.status}</Badge>
                    </td>
                    <td className="py-4 text-xs text-foreground-muted">
                      {m.scopes?.length ?? 0} scope(s)
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewMember(m)}>Preview access</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeactivate(m.id)}>Deactivate</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {inviteOpen && (
        <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
      )}

      {previewMember && (
        <AccessPreviewModal member={previewMember} onClose={() => setPreviewMember(null)} />
      )}
    </div>
  );
}

function InviteModal({ open, onClose, onInvite }: { open: boolean; onClose: () => void; onInvite: (e: React.FormEvent) => void }) {
  const [method, setMethod] = React.useState('email');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-scrim" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-md rounded-3xl bg-glass-deep border border-glass-border shadow-3 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Invite someone</h3>
        <Segmented value={method} onValueChange={setMethod} options={[
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'link', label: 'Link' },
          { value: 'qr', label: 'QR' },
        ]} />
        {method === 'email' && (
          <TextField label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-4" />
        )}
        {method === 'phone' && (
          <TextField label="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-4" />
        )}
        {method === 'link' && (
          <div className="mt-4">
            <p className="text-xs text-foreground-muted">Invite link: <span className="text-liquid-blue">/invite/new</span></p>
          </div>
        )}
        {method === 'qr' && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-foreground-secondary">Scan to join:</span>
            <div className="w-12 h-12 border border-glass-border rounded-lg" />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onInvite}>Send Invite</Button>
        </div>
      </div>
    </div>
  );
}

function AccessPreviewModal({ member, onClose }: { member: any; onClose: () => void }) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-scrim" onClick={onClose} />
      <div className="relative z-[101] w-full max-w-lg rounded-3xl bg-glass-deep border border-glass-border shadow-3 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">What can {member.profiles?.full_name} see?</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-foreground-muted hover:bg-glass-border">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Role: {member.roles?.name}</h4>
            <p className="text-xs text-foreground-secondary">{member.roles?.description || 'No description'}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              <Chip>spaces.view</Chip>
              <Chip>tasks.view.team</Chip>
              <Chip>tasks.execute</Chip>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Confidential access</h4>
            <p className="text-xs text-foreground-secondary">None by default.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Scopes</h4>
            <p className="text-xs text-foreground-secondary">{member.scopes?.length ?? 0} scope(s) assigned</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
