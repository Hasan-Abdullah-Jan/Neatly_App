/**
 * SettingsPage — Level 2 settings.
 * Profile, organization, language, timezone, sensory settings, notification preferences.
 */

import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, Button, Toggle, Select, ListRow } from '@neatly/ui';
import { User, Globe, Clock, Volume2, Vibrate, Eye, Bell, ShieldAlert, Users } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export function SettingsPage() {
  const [profile, setProfile] = React.useState<any>(null);
  const [sound, setSound] = React.useState(false);
  const [haptics, setHaptics] = React.useState(true);
  const [motion, setMotion] = React.useState<'full' | 'reduced'>('full');
  const [glass, setGlass] = React.useState<'liquid' | 'lite' | 'solid'>('liquid');
  const [contrast, setContrast] = React.useState<'normal' | 'high'>('normal');
  const [language, setLanguage] = React.useState('en');
  const [timezone, setTimezone] = React.useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  React.useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', (await supabase.auth.getUser()).data.user?.id).single();
    if (data) {
      setProfile(data);
      setLanguage(data.locale);
      setTimezone(data.timezone);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    await supabase.from('profiles').update({
      locale: language,
      timezone,
    }).eq('id', profile.id);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      <Card padding="base">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
        <div className="space-y-4">
          <ListRow leading={<User className="w-5 h-5 text-foreground-muted" />}>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{profile?.full_name || '—'}</div>
              <div className="text-xs text-foreground-muted">{profile?.email || profile?.phone || '—'}</div>
            </div>
          </ListRow>
          <ListRow leading={<Globe className="w-5 h-5 text-foreground-muted" />}>
            <span className="text-sm text-foreground-secondary">Language</span>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-32">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </Select>
          </ListRow>
          <ListRow leading={<Clock className="w-5 h-5 text-foreground-muted" />}>
            <span className="text-sm text-foreground-secondary">Timezone</span>
            <Select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-48">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </Select>
          </ListRow>
        </div>
        <div className="mt-4">
          <Button onClick={saveProfile}>Save profile</Button>
        </div>
      </Card>

      <Card padding="base">
        <h2 className="text-lg font-semibold text-foreground mb-4">Organization</h2>
        <div className="space-y-4">
          <ListRow leading={<ShieldAlert className="w-5 h-5 text-foreground-muted" />}>
            <span className="text-sm text-foreground-secondary">Organization name</span>
            <span className="ml-auto text-sm text-foreground">My Organization</span>
          </ListRow>
          <ListRow leading={<Users className="w-5 h-5 text-foreground-muted" />}>
            <span className="text-sm text-foreground-secondary">Profile type</span>
            <span className="ml-auto text-sm text-foreground">Small business</span>
          </ListRow>
        </div>
      </Card>

      <Card padding="base">
        <h2 className="text-lg font-semibold text-foreground mb-4">Sensory & accessibility</h2>
        <div className="space-y-4">
          <ListRow leading={<Volume2 className="w-5 h-5 text-foreground-muted" />}>
            <span className="text-sm text-foreground-secondary">Sound</span>
            <span className="text-xs text-foreground-muted">Off by default</span>
            <Toggle checked={sound} onChange={() => setSound(!sound)} />
          </ListRow>
          <ListRow leading={<Vibrate className="w-5 h-5 text-foreground-muted" />}>
            <span className="text-sm text-foreground-secondary">Haptics</span>
            <span className="text-xs text-foreground-muted">Light tactile feedback</span>
            <Toggle checked={haptics} onChange={() => setHaptics(!haptics)} />
          </ListRow>
          <ListRow leading={<Eye className="w-5 h-5 text-foreground-muted" />}>
            <span className="text-sm text-foreground-secondary">Motion</span>
            <Select value={motion} onChange={(e) => setMotion(e.target.value as 'full' | 'reduced')} className="w-40">
              <option value="full">Full motion</option>
              <option value="reduced">Reduced motion</option>
            </Select>
          </ListRow>
          <ListRow>
            <span className="text-sm text-foreground-secondary">Glass</span>
            <Select value={glass} onChange={(e) => setGlass(e.target.value as 'liquid' | 'lite' | 'solid')} className="w-40">
              <option value="liquid">Liquid</option>
              <option value="lite">Lite</option>
              <option value="solid">Solid</option>
            </Select>
          </ListRow>
          <ListRow>
            <span className="text-sm text-foreground-secondary">Contrast</span>
            <Select value={contrast} onChange={(e) => setContrast(e.target.value as 'normal' | 'high')} className="w-40">
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </Select>
          </ListRow>
        </div>
        <div className="mt-4">
          <Button>Apply sensory settings</Button>
        </div>
      </Card>

      <Card padding="base">
        <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
        <p className="text-sm text-foreground-secondary mb-4">Notification preferences come in Level 3.</p>
        <ListRow leading={<Bell className="w-5 h-5 text-foreground-muted" />}>
          <span className="text-sm text-foreground-secondary">Push notifications</span>
          <Toggle checked={true} disabled />
        </ListRow>
        <ListRow leading={<Bell className="w-5 h-5 text-foreground-muted" />}>
          <span className="text-sm text-foreground-secondary">Email digests</span>
          <Toggle checked={false} disabled />
        </ListRow>
      </Card>
    </div>
  );
}
