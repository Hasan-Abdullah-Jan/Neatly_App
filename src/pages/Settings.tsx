import { Download, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Button, IconButton, MemberDot, PageHeader, Segmented } from '../components/ui';
import { todayISO } from '../domain';
import { MEMBER_COLORS, exportBackup, useData } from '../store/data';
import { useTheme, type ThemePref } from '../store/theme';
import { useUI } from '../store/ui';

export function Settings() {
  const { pref, setPref } = useTheme();
  const members = useData((s) => s.members);
  const currentMemberId = useData((s) => s.currentMemberId);
  const counts = {
    spaces: useData((s) => s.spaces.length),
    chores: useData((s) => s.chores.length),
    completions: useData((s) => s.completions.length),
  };
  const { addMember, updateMember, removeMember, setCurrentMember, importData, resetAll } = useData.getState();
  const toast = useUI((s) => s.toast);
  const [newName, setNewName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neatly-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup downloaded');
  };

  const restore = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!window.confirm('Replace everything on this device with the backup?')) return;
      importData(data);
      toast('Backup restored');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not read that file');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <PageHeader title="Settings" />

      <Section title="Appearance">
        <Segmented<ThemePref>
          label="Theme"
          value={pref}
          onChange={setPref}
          options={[
            { value: 'system', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </Section>

      <Section title="Household" description="Assign chores to people and see who's pulling their weight.">
        <ul className="mb-3 divide-y divide-line">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2">
              <label className="relative cursor-pointer" title="Change color">
                <MemberDot name={m.name} color={m.color} size="md" />
                <select
                  className="absolute inset-0 cursor-pointer opacity-0"
                  value={m.color}
                  onChange={(e) => updateMember(m.id, { color: e.target.value })}
                  aria-label={`Color for ${m.name}`}
                >
                  {MEMBER_COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <input
                className="input flex-1"
                value={m.name}
                maxLength={30}
                onChange={(e) => updateMember(m.id, { name: e.target.value })}
                aria-label="Name"
              />
              <IconButton
                label={`Remove ${m.name}`}
                onClick={() => {
                  if (window.confirm(`Remove ${m.name}? Their chores become unassigned.`)) removeMember(m.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newName.trim()) return;
            const id = addMember(newName);
            if (!currentMemberId) setCurrentMember(id);
            setNewName('');
          }}
        >
          <input className="input" placeholder="Add a person" value={newName} maxLength={30} onChange={(e) => setNewName(e.target.value)} aria-label="New person's name" />
          <Button type="submit" variant="secondary" disabled={!newName.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </form>
        {members.length > 0 && (
          <div className="mt-4">
            <label className="label" htmlFor="current-member">
              Who uses this device?
            </label>
            <select
              id="current-member"
              className="input"
              value={currentMemberId ?? ''}
              onChange={(e) => setCurrentMember(e.target.value || null)}
            >
              <option value="">Nobody in particular</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">Chores ticked off here are credited to this person.</p>
          </div>
        )}
      </Section>

      <Section
        title="Your data"
        description={`Stored only in this browser: ${counts.spaces} spaces, ${counts.chores} chores, ${counts.completions} completed. Download a backup to move it to another device.`}
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={download}>
            <Download className="h-4 w-4" /> Download backup
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Restore backup
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Erase all spaces, chores, people and history from this device? This cannot be undone.')) {
                resetAll();
                toast('Everything erased');
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Erase everything
          </Button>
        </div>
      </Section>

      <p className="mt-8 text-center text-xs text-muted">
        Neatly works offline and can be installed from your browser's menu (“Add to Home Screen”).
      </p>
    </>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card mb-4 p-5">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mb-4 mt-1 text-sm text-muted">{description}</p>}
      {!description && <div className="mb-3" />}
      {children}
    </section>
  );
}
