# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

No test framework is currently configured.

To run Supabase locally:
```bash
supabase start   # Starts local Supabase (API: 54321, DB: 54322, Studio: 54323)
supabase stop
supabase db reset  # Reset and re-run migrations
```

Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local.example`).

## Architecture

**HydrateTrack** is a Next.js 16 (App Router) + Supabase hydration tracking app with a gamification layer (score + streaks).

### Dual-mode data layer

The app supports two modes that share the same component tree:
- **Guest mode**: All data persisted in `localStorage` via `src/lib/guest-storage.ts`
- **Authenticated mode**: Data stored in Supabase (`profiles` + `water_logs` tables)

`HydrationProvider` (`src/contexts/hydration-context.tsx`) wraps the `(app)` route group and provides centralized state via React Context. It handles guest/auth detection, fetches data, and exposes optimistic CRUD operations through `useHydrationContext()`. The older `useHydration` hook (`src/hooks/use-hydration.ts`) still exists but new code should prefer the context.

### Core business logic

| File | Responsibility |
|------|---------------|
| `src/lib/hydration-score.ts` | Calculates a 0–100 score: 70% volume (intake vs. goal), 30% distribution (how evenly spread across active hours in 8 slots) |
| `src/lib/streaks.ts` | Computes current and longest streaks of days meeting the daily goal |
| `src/lib/units.ts` | ml ↔ oz conversions |
| `src/lib/guest-storage.ts` | localStorage schema: `hydration_guest_data` (logs + profile), `hydration_guest_mode`, `hydration_guest_onboarded` |

### Database (Supabase/Postgres)

Two tables with RLS enabled — users can only access their own rows:
- **profiles**: User settings (`daily_goal_ml`, `weight_kg`, `preferred_unit`, `active_hours_start/end`, reminder settings). Linked 1:1 to `auth.users`.
- **water_logs**: `amount_ml` + `logged_at` per entry, indexed on `(user_id, logged_at)`.

Migrations live in `supabase/migrations/`. Auth supports email and Google OAuth via Supabase SSR cookie-based sessions.

### App routes

Authenticated pages are grouped under a `(app)` route group with a shared layout (`src/app/(app)/layout.tsx`) that wraps children in `HydrationProvider` + `AppShell`.

```
/                    → Landing page (src/app/page.tsx)
/onboarding          → First-run profile setup
/(app)/dashboard     → Main daily tracking view
/(app)/history       → Historical log view
/(app)/settings      → Profile and preferences
/login               → Auth
/auth/callback       → Auth callback handling
```

`src/proxy.ts` handles session refresh on every request.

### App shell & navigation

`AppShell` (`src/components/app-shell.tsx`) provides the navigation chrome:
- **Desktop**: Fixed sidebar with nav links (Dashboard, History, Settings)
- **Mobile**: Bottom navigation bar with safe-area padding

It is rendered once in the `(app)` layout — individual pages only contain their own content.

### Path alias

`@/*` maps to `src/*` throughout the codebase.

## UI & Component Rules

### Component library: shadcn/ui + Base UI

The app uses **shadcn/ui** (base-nova style) built on `@base-ui/react` primitives. Configuration is in `components.json`. Available components in `src/components/ui/`:

`alert`, `badge`, `button`, `card`, `input`, `label`, `progress`, `select`, `separator`, `sonner`, `switch`

Key utilities: `class-variance-authority` (CVA) for variants, `tailwind-merge` + `clsx` via `src/lib/utils.ts` (`cn()` helper). Icon library: `lucide-react`.

### Toast notifications

The app uses **Sonner** for toasts. `<Toaster />` is mounted in the root layout (`src/app/layout.tsx`). Import `toast` from `"sonner"` to trigger notifications.

### Theme system

`globals.css` defines semantic color tokens using **OKLCH color space** in CSS custom properties. Both `:root` (light) and `.dark` variants are defined. Always use semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `text-primary`, etc.) — never hardcode color values.

Dark mode is handled via CSS class strategy (`.dark` on `<html>`).

### Font

The app uses **Inter** from Google Fonts, loaded via `next/font/google` in the root layout and applied through the `--font-sans` CSS variable. Use Inter for all text — do not add other font families.

### Base UI Button + Link navigation

Never use `<Button render={<Link href="..." />}>` — Base UI expects a native `<button>` element by default and will warn when `nativeButton` is true but a non-button element is rendered. For navigation that looks like a button, use a plain `<Link>` with appropriate Tailwind classes instead. Reserve `<Button>` for actual interactive actions (submit, onClick handlers).

### Color palette

The app uses a water-inspired sky-blue color palette. Use `sky-500`/`sky-600` for primary interactive elements (buttons, active nav, links) instead of generic `blue-500`. Background colors should use the semantic `bg-background` token (defined in `globals.css` via OKLCH) rather than hardcoded `bg-white dark:bg-gray-950`.

### Dark mode contrast

Status colors in dark mode must use `-300` variants (e.g., `dark:text-yellow-300`, `dark:text-green-300`) to meet WCAG 4.5:1 contrast. Never use `-400` or `-500` for status text on dark backgrounds.

### Tailwind v4

The project uses **Tailwind CSS v4** with `@tailwindcss/postcss`. Theme extensions use `@theme inline` blocks in `globals.css`, not `tailwind.config`. Animation utilities come from `tw-animate-css`.
