# HydrateTrack

A hydration tracking app built with Next.js 16 and Supabase. Log water intake with a single tap, track your Hydration Score, and build daily streaks.

## Features

- **One-Tap Logging** — Quick-add buttons for common amounts (glass, bottle, etc.)
- **Hydration Score** — A 0–100 score based on volume (70%) and intake distribution across the day (30%)
- **Streak Tracking** — Track consecutive days of meeting your daily goal
- **Guest Mode** — Use the app without an account (data stored in localStorage)
- **Authenticated Mode** — Sign in with email or Google to sync data via Supabase
- **Unit Preferences** — Switch between ml and oz
- **Dark Mode** — Automatic light/dark theme support

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- [React 19](https://react.dev/)
- [Supabase](https://supabase.com/) (Postgres, Auth, RLS)
- [Tailwind CSS 4](https://tailwindcss.com/)
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (or run Supabase locally)

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/your-username/hydration-tracking.git
   cd hydration-tracking
   npm install
   ```

2. Copy the environment file and fill in your Supabase credentials:

   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Run database migrations (if using local Supabase):

   ```bash
   supabase start
   supabase db reset
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Main daily tracking view
│   ├── history/          # Historical log view
│   ├── settings/         # Profile and preferences
│   ├── onboarding/       # First-run setup
│   ├── login/            # Authentication
│   └── auth/             # Auth callback handling
├── components/           # Shared UI components
├── hooks/                # Custom React hooks
│   └── use-hydration.ts  # Core hook abstracting guest/auth data
├── lib/                  # Business logic and utilities
│   ├── hydration-score.ts
│   ├── streaks.ts
│   ├── guest-storage.ts
│   └── units.ts
└── types/                # TypeScript type definitions
```

## License

MIT
