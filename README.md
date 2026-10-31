# Neatly

A calm, offline-first planner for keeping your home (or any space) clean.

Tell Neatly which rooms you look after and it builds a cleaning routine with
sensible frequencies, spread across the week so nothing piles up. Tick chores off
as you go and it reschedules them automatically.

## Features

- **Today** — what's overdue and due today, your progress ring, streak, and
  minutes cleaned this week. Done something by mistake? Every completion has *Undo*.
- **"Got a few minutes?"** — pick 5, 15, 30 or 60 minutes and Neatly picks the
  most urgent chores that fit, topping up with upcoming ones so you can get ahead.
- **Spaces with freshness scores** — each room shows how up to date it is
  (it decays as chores go overdue, relative to how often they should happen), so
  you know where to start. Spaces suggest typical chores you haven't added yet.
- **Recurring chores** — every N days, weeks or months; effort in minutes; notes;
  pause/resume; *do it tomorrow*. The next due date counts from when you
  actually did it.
- **Plan** — a 7- or 14-day agenda with a per-day workload chart to spot heavy days.
- **Household** — add people, assign chores, filter to *Mine*, and see who did what
  this week. Completions are credited to whoever uses the device.
- **Private by default** — no account, no server. Data lives in the browser
  (localStorage). Download/restore a JSON backup to move between devices.
- **Installable PWA** — works offline; light, dark and automatic themes.

## Development

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # domain + store unit tests
pnpm build      # typecheck + production build into dist/
```

Project layout:

```
src/
  domain/      pure logic: dates, scheduling, freshness, quick plan, agenda, templates (+ tests)
  store/       zustand stores — persisted data, theme, UI (toasts, editor)
  components/  layout, chore row, chore editor, shared UI
  pages/       Welcome, Today, Chores, Spaces, Plan, Settings
scripts/       generate-icons.mjs — renders public/favicon.svg to PWA PNG icons
```

## Deploy to Vercel

The repo is a plain Vite app with a `vercel.json` (SPA rewrites + caching), so no
configuration is needed:

1. Go to <https://vercel.com/new> and import this GitHub repository.
2. Keep the detected settings (Framework: Vite, build `pnpm build`, output `dist`).
3. Click **Deploy**. Every push to `main` redeploys automatically.

Or from a terminal: `npx vercel --prod`.
