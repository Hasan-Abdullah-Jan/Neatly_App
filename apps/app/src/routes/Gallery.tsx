/**
 * Gallery — renders every component in every state.
 *
 * Matrix: theme (dark × light) × glass (liquid × lite × solid) × motion (full × reduced).
 * Used for visual QA and automated contrast/animation tests.
 */

import {
  ThemeProvider,
  useTheme,
  GlassSurface,
  Button,
  LiquidButton,
  IconButton,
  ContextFab,
  FloatingDock,
  Card,
  ExpandableCard,
  Sheet,
  Modal,
  Toast,
  Badge,
  Segmented,
  TextField,
  Textarea,
  Select,
  Checkbox,
  Toggle,
  Radio,
  Slider,
  Stepper,
  Chip,
  Avatar,
  AvatarGroup,
  ListRow,
  ProgressRing,
  ProgressOrb,
  StatCounter,
  Skeleton,
  EmptyState,
  Timeline,
  BeforeAfterSlider,
  PhotoGrid,
  Sparkline,
  QRCodeView,
  CommandPalette,
} from '@neatly/ui';
import { Plus, X } from 'lucide-react';

const THEMES: Array<{ theme: 'dark' | 'light'; label: string }> = [
  { theme: 'dark', label: 'Midnight (dark)' },
  { theme: 'light', label: 'Daybreak (light)' },
];

const GLASSES: Array<{ glass: 'liquid' | 'lite' | 'solid'; label: string }> = [
  { glass: 'liquid', label: 'Liquid' },
  { glass: 'lite', label: 'Lite' },
  { glass: 'solid', label: 'Solid' },
];

const MOTIONS: Array<{ motion: 'full' | 'reduced'; label: string }> = [
  { motion: 'full', label: 'Full motion' },
  { motion: 'reduced', label: 'Reduced motion' },
];

export function Gallery() {
  const { state, setTheme, setGlass, setMotion } = useTheme();

  return (
    <ThemeProvider>
      <div className="flex flex-col h-full bg-background">
        {/* Header: theme/glass/mode matrix controls */}
        <div className="sticky top-0 z-30 border-b border-glass-border/50 bg-background/80 backdrop-blur-md p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Gallery</h2>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.theme}
                  onClick={() => setTheme(t.theme)}
                  aria-pressed={state.theme === t.theme}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    state.theme === t.theme
                      ? 'bg-liquid-blue text-inverse border-transparent'
                      : 'border-glass-border text-foreground-secondary hover:bg-glass-surface/50 hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-foreground-muted">Glass:</span>
            {GLASSES.map((g) => (
              <button
                key={g.glass}
                onClick={() => setGlass(g.glass)}
                aria-pressed={state.glass === g.glass}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  state.glass === g.glass
                    ? 'bg-liquid-blue text-inverse border-transparent'
                    : 'border-glass-border text-foreground-secondary hover:bg-glass-surface/50 hover:text-foreground'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-foreground-muted">Motion:</span>
            {MOTIONS.map((m) => (
              <button
                key={m.motion}
                onClick={() => setMotion(m.motion)}
                aria-pressed={state.motion === m.motion}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  state.motion === m.motion
                    ? 'bg-liquid-blue text-inverse border-transparent'
                    : 'border-glass-border text-foreground-secondary hover:bg-glass-surface/50 hover:text-foreground'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-16">
          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Buttons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <LiquidButton>Liquid primary</LiquidButton>
              <LiquidButton variant="secondary">Liquid secondary</LiquidButton>
              <Button loading>Loading</Button>
              <Button success>Success</Button>
              <Button disabled>Disabled</Button>
              <IconButton ariaLabel="Add" variant="primary">
                <Plus className="w-4 h-4" />
              </IconButton>
              <IconButton ariaLabel="Close" variant="ghost">
                <X className="w-4 h-4" />
              </IconButton>
              <ContextFab action="add" />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Navigation</h3>
            <div className="flex gap-4">
              <FloatingDock activeKey="home" onSelect={() => {}} />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Cards & surfaces</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card level={1} padding="base">
                <h4 className="text-sm font-semibold text-foreground">Level 1 card</h4>
                <p className="text-xs text-foreground-secondary">Soft shadow, base radius.</p>
              </Card>
              <Card level={2} padding="base">
                <h4 className="text-sm font-semibold text-foreground">Level 2 card</h4>
                <p className="text-xs text-foreground-secondary">Main card radius 24px.</p>
              </Card>
              <Card level={3} padding="base">
                <h4 className="text-sm font-semibold text-foreground">Level 3 card</h4>
                <p className="text-xs text-foreground-secondary">Deeper shadow.</p>
              </Card>
              <GlassSurface level={1} className="p-6">
                <p className="text-xs text-foreground-secondary">Glass surface level 1</p>
              </GlassSurface>
              <GlassSurface level={2} inset className="p-6">
                <p className="text-xs text-foreground-secondary">Inset glass surface</p>
              </GlassSurface>
              <ExpandableCard title="Expandable workspace">
                <p className="text-sm text-foreground-secondary">
                  Expand this card into a full-screen workspace.
                </p>
              </ExpandableCard>
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Overlays</h3>
            <div className="flex gap-4 items-start">
              <Sheet open={false} onClose={() => {}} title="Sheet">
                <p className="text-sm text-foreground-secondary">Draggable sheet content.</p>
              </Sheet>
              <Modal open={false} onClose={() => {}} title="Modal">
                <p className="text-sm text-foreground-secondary">Centered modal content.</p>
              </Modal>
              <Toast id="t1" type="info" title="Info" message="This is an info toast." />
              <Toast id="t2" type="success" title="Saved" message="Changes saved successfully." />
              <Toast id="t3" type="error" title="Error" message="Something went wrong." />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Forms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField label="Text field" placeholder="Enter text…" />
              <TextField label="With error" error="This field is required" />
              <Textarea label="Textarea" rows={3} placeholder="Write something…" />
              <Select label="Select">
                <option value="a">Option A</option>
                <option value="b">Option B</option>
              </Select>
              <Checkbox label="I agree" />
              <Toggle label="Notifications" />
              <Radio label="Option 1" value="a" checked onChange={() => {}} />
              <Radio label="Option 2" value="b" onChange={() => {}} />
              <Slider label="Intensity" />
              <Stepper label="Count" value={3} onChange={(updater) => updater(3)} />
            </div>
            <div className="flex gap-2">
              <Segmented
                value="a"
                onValueChange={() => {}}
                options={[
                  { value: 'a', label: 'List' },
                  { value: 'b', label: 'Grid' },
                ]}
              />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Data display</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Chip variant="default">Default</Chip>
              <Chip variant="outline">Outline</Chip>
              <Chip variant="filled">Filled</Chip>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Avatar name="Alex Rivera" src={undefined} size="base" />
              <AvatarGroup users={[{ name: 'Alex' }, { name: 'Sam' }, { name: 'Jordan' }, { name: 'Casey' }]} />
              <ProgressRing value={65} label="65%" size="base" />
              <ProgressOrb value={72} secondaryValue={85} label="72 percent verified" size="lg" />
              <StatCounter value={1240} label="Tasks completed" />
            </div>
            <div className="space-y-2">
              <ListRow leading={<Avatar name="Alex" />} trailing={<Badge variant="success">Done</Badge>}>
                Review floor plan
              </ListRow>
              <ListRow leading={<Avatar name="Sam" />} swipeActions={<button>Archive</button>}>
                Check restrooms
              </ListRow>
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Feedback & misc</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton variant="circle" />
              <Skeleton variant="text" />
              <Skeleton variant="block" className="h-20 w-full" />
              <EmptyState
                title="Your space is clear"
                description="Add something whenever you&apos;re ready."
              />
              <Timeline
                items={[
                  { title: 'Submitted', time: '10:00', status: 'done' },
                  { title: 'Assigned', time: '10:15', status: 'done' },
                  { title: 'In progress', time: '10:30', status: 'active' },
                  { title: 'Verified', time: '–', status: 'pending' },
                ]}
              />
            </div>
            <div className="flex gap-4">
              <BeforeAfterSlider
                before="https://picsum.photos/seed/before/400/300"
                after="https://picsum.photos/seed/after/400/300"
                label="Before/After"
              />
              <PhotoGrid images={[
                { src: 'https://picsum.photos/seed/p1/200/200', alt: 'Photo 1' },
                { src: 'https://picsum.photos/seed/p2/200/200', alt: 'Photo 2' },
                { src: 'https://picsum.photos/seed/p3/200/200', alt: 'Photo 3' },
              ]} cols={3} />
              <QRCodeView value="https://neatly.app/report/abc123" size={140} />
            </div>
            <div className="w-64">
              <Sparkline data={[10, 35, 20, 55, 40, 70, 60, 85]} height={60} />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground">Command palette</h3>
            <CommandPalette
              open={false}
              onClose={() => {}}
              items={[
                { id: 'add-task', title: 'Add task', subtitle: 'Create a new task', shortcut: '⌘N', onSelect: () => {} },
                { id: 'report', title: 'Report issue', subtitle: 'File a public report', shortcut: '⌘R', onSelect: () => {} },
              ]}
            />
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
}
