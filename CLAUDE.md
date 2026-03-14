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

The `useHydration` hook (`src/hooks/use-hydration.ts`) abstracts this distinction — it detects guest mode and routes reads/writes accordingly. Components always talk to `useHydration`, never directly to Supabase or localStorage.

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

```
/               → Landing page
/onboarding     → First-run profile setup
/dashboard      → Main daily tracking view
/history        → Historical log view
/settings       → Profile and preferences
/login          → Auth
/auth           → Auth callback handling
```

`src/middleware.ts` handles session refresh on every request.

### Path alias

`@/*` maps to `src/*` throughout the codebase.
