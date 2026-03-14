# Hydration Tracking App – V1 Requirements

## 1. Product Overview

A lightweight web application that helps users track their daily water intake, build a consistent hydration habit, and understand their hydration quality through a daily Hydration Score.

**Core value proposition:**

- Help users track daily water intake with minimal effort
- Provide a meaningful **Hydration Score** that reflects both volume and intake distribution
- Build a hydration habit through streaks and reminders
- Reduce friction when logging water — one tap to log

**Tech stack:**

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router) with TypeScript |
| Styling | TailwindCSS |
| Backend / Auth | Supabase (Postgres + Auth + Edge Functions) |
| Deployment | Vercel (web app with PWA support) |

---

## 2. Target Users

| Persona | Description |
| --- | --- |
| Busy professionals | Don't have time to think about hydration; need fast, frictionless logging |
| Fitness / health-conscious users | Already tracking nutrition; want hydration data alongside their routine |
| Forgetful drinkers | Know they should drink more water but need nudges throughout the day |

**Common trait:** All personas value speed and simplicity over feature richness.

---

## 3. Core Product Principles

1. **Extremely fast logging** — Adding water intake must be a single tap. No modals, no confirmations.
2. **Minimal friction** — The app should get out of the user's way. Fewer screens, fewer decisions.
3. **Clean visual progress** — Users should instantly see how close they are to their daily goal.
4. **Actionable insights** — The Hydration Score turns raw data into a simple, motivating number.
5. **Habit building** — Streaks and reminders reinforce daily consistency.

---

## 4. MVP Features

### 4.1 User Authentication

Two modes: **Google login** (full experience) or **Guest mode** (zero-friction start).

#### 4.1.1 Google Login

**Provider:** Supabase Auth with Google OAuth

**Requirements:**

- Single "Continue with Google" button — no email/password forms
- On first login, user is directed to onboarding to set weight and confirm goal
- Profile name and email are auto-populated from Google account
- Sessions persist across page reloads (Supabase session management)

**Profile fields:**

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| name | string | Yes | From Google account |
| weight_kg | number (kg) | Yes | — |
| daily_goal_ml | number (ml) | Yes | Auto-calculated from weight |
| preferred_unit | `ml` or `oz` | Yes | `ml` |

#### 4.1.2 Guest Mode

**Requirements:**

- "Continue as Guest" button on the landing/login screen
- All data (logs, goal, settings, streaks) stored in **localStorage only** — no Supabase writes
- Guest users get the full dashboard experience without creating an account
- Guest data persists across page reloads but is device-local and not backed up
- Prompt to upgrade to Google login is shown in settings and periodically on the dashboard
- On upgrade (guest → Google login), migrate localStorage data to Supabase so no data is lost

---

### 4.2 Daily Water Logging

The primary interaction of the app. Users must be able to log water intake in under 1 second.

**Requirements:**

- Preset quick-add buttons displayed prominently on the dashboard, adapted to the user's preferred unit (see section 4.7):
  - **ml:** +100 ml, +250 ml, +500 ml
  - **oz:** +4 oz, +8 oz, +16 oz
- Custom input option for arbitrary amounts (in the user's preferred unit)
- Each log is saved with an automatic timestamp
- Users can delete a log entry
- Users can edit the amount on an existing log entry
- Logs are scoped to the authenticated user (or localStorage for guests)
- All logs for the current day are visible on the dashboard

**UX emphasis:** Quick-add buttons should be the largest, most accessible tap targets on the dashboard. One tap = logged. No confirmation dialogs.

---

### 4.3 Daily Hydration Goal

The system calculates a suggested daily hydration goal based on the user's weight.

**Formula:**

```
daily_goal_ml = weight_kg × 35
```

**Example:** 70 kg × 35 = **2,450 ml**

**Requirements:**

- Goal is auto-calculated on account creation based on entered weight
- Users can manually override the goal to any value
- If weight is updated, prompt the user to recalculate or keep their custom goal
- Goal is stored per user and used across dashboard, progress, and streaks

---

### 4.4 Hydration Score

A daily score from **0–100** that reflects both *how much* and *how well* a user hydrates throughout the day.

#### 4.4.1 Score Calculation

The score is a weighted composite of two components:

| Component | Weight | Formula |
| --- | --- | --- |
| Volume Score | 70% | `min((current_intake_ml / daily_goal_ml) × 100, 100)` |
| Distribution Score | 30% | Based on evenness of intake across active hours (see below) |

**Total Hydration Score:**

```
hydration_score = (volume_score × 0.7) + (distribution_score × 0.3)
```

**Distribution Score logic:**

1. Divide the user's active hours into equal slots (e.g., 16 active hours → 4 slots of 4 hours each, or 8 slots of 2 hours each).
2. Calculate expected intake per slot: `daily_goal_ml / number_of_slots`.
3. For each slot, compute the ratio: `min(slot_intake / expected_per_slot, 1.0)`.
4. Distribution Score = average of all slot ratios × 100.

A user who drinks evenly throughout the day scores 100 on distribution. A user who drinks everything in one sitting scores low.

#### 4.4.2 Display

- Shown **prominently** on the dashboard alongside the progress ring
- Displayed as a large number (e.g., "78") with a label ("Hydration Score")
- Color-coded feedback:

| Range | Color | Label |
| --- | --- | --- |
| 80–100 | Green | Excellent |
| 60–79 | Blue | Good |
| 40–59 | Yellow | Fair |
| 0–39 | Red | Needs improvement |

#### 4.4.3 Requirements

- Score recalculates in real time as logs are added
- Score resets daily at the start of the user's active hours
- Available for both authenticated and guest users
- Score is computed client-side (no separate DB column needed — derived from `water_logs`)

---

### 4.5 Hydration Dashboard

The main screen of the app. Displays current hydration status, the Hydration Score, and provides quick logging controls.

**Display elements:**

| Element | Description |
| --- | --- |
| **Hydration Score** | Large score (0–100) with color-coded label, displayed at the top |
| **Progress ring** | Circular visualization showing percentage of goal completed |
| **Intake summary** | Text display in preferred unit, e.g., "1,600 ml / 2,450 ml" or "54 oz / 83 oz" |
| **Remaining amount** | e.g., "850 ml remaining" or "29 oz remaining" |
| **Quick-add buttons** | Adapted to preferred unit (ml: +100, +250, +500; oz: +4, +8, +16), plus Custom |
| **Streak counter** | Current streak displayed as "🔥 5 days" |
| **Today's log timeline** | Chronological list of today's entries with timestamps and amounts |

**Requirements:**

- Dashboard is the default authenticated landing screen
- Progress ring animates on log addition
- Hydration Score updates in real time after each log
- Timeline entries show time (e.g., "2:30 PM") and amount in the preferred unit (e.g., "+250 ml" or "+8 oz")
- Each timeline entry has edit/delete actions
- Dashboard data refreshes in real time after logging

---

### 4.6 Hydration Reminder System

Nudge users when they are falling behind their expected intake pace.

**Logic:**

```
expected_intake = (daily_goal_ml / active_hours) × hours_elapsed
if current_intake < expected_intake → trigger reminder
```

Assume active hours = 16 hours (e.g., 7 AM – 11 PM), configurable per user.

**Requirements:**

- Configurable reminder interval (e.g., every 1h, 2h, 3h)
- Reminders delivered via web push notifications (using the Push API where supported)
- Fallback: in-app banner notification if push is not available or not granted
- Reminder toggle (on/off) in settings
- Reminders are only sent during the user's active hours

---

### 4.7 Unit Switching (ml / oz)

Users can choose their preferred display unit. All internal storage and calculations remain in **milliliters** for consistency.

**Conversion constant:** 1 fl oz = 29.5735 ml

#### 4.7.1 Requirements

- Unit preference (`ml` or `oz`) is selectable in **Settings** and during **Onboarding**
- Default unit: `ml`
- All user-facing surfaces adapt to the chosen unit:

| Surface | ml mode | oz mode |
| --- | --- | --- |
| Quick-add buttons | +100 ml, +250 ml, +500 ml | +4 oz, +8 oz, +16 oz |
| Progress ring label | "1,600 ml / 2,450 ml" | "54 oz / 83 oz" |
| Remaining amount | "850 ml remaining" | "29 oz remaining" |
| Custom input | Accepts ml | Accepts oz |
| Log timeline entries | "+250 ml" | "+8 oz" |
| History view | Daily totals in ml | Daily totals in oz |
| Daily goal (settings) | Displayed / editable in ml | Displayed / editable in oz |

#### 4.7.2 Conversion Rules

- **Display:** Convert stored ml values to oz on render using `amount_oz = amount_ml / 29.5735`, rounded to the nearest whole number.
- **Input:** Convert user-entered oz values to ml before saving using `amount_ml = amount_oz × 29.5735`, rounded to the nearest integer.
- **Backend:** `water_logs.amount_ml` and `profiles.daily_goal_ml` are always stored in ml regardless of display unit.
- **Hydration Score & Streaks:** All calculations use ml values internally — unit preference has no effect on scoring logic.

#### 4.7.3 Guest Mode

- Unit preference stored in localStorage alongside other guest data
- Migrated to `profiles.preferred_unit` on guest → Google login upgrade

---

### 4.8 Streak Tracking

Encourage habit formation by tracking consecutive days where the user meets their hydration goal.

**Requirements:**

- A day counts as "completed" if total intake >= daily_goal_ml
- Track **current streak** (consecutive completed days ending today or yesterday)
- Track **longest streak** (all-time best)
- Streak is displayed on the dashboard
- Streak resets if a day is missed (intake < goal and the day has passed)

**Implementation:** Streaks are calculated dynamically from `water_logs` rather than stored in a separate table. Query logic:

```sql
-- Get daily totals, flag completed days, then count consecutive completed days
-- ending at the most recent day (today or yesterday)
SELECT DATE(logged_at) AS log_date,
       SUM(amount_ml) >= p.daily_goal_ml AS goal_met
FROM water_logs wl
JOIN profiles p ON p.id = wl.user_id
WHERE wl.user_id = :uid
GROUP BY DATE(logged_at), p.daily_goal_ml
ORDER BY log_date DESC;
```

Walk backward from the latest completed day; stop at the first gap or missed day. This eliminates the `streaks` table and avoids stale data.

---

## 5. Data Model

### `profiles`

Linked 1:1 with `auth.users` via Supabase Auth. The `id` column mirrors the Supabase Auth user ID.

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | PK, references `auth.users(id)` on delete cascade |
| email | text | unique, not null |
| name | text | not null |
| weight_kg | numeric | not null |
| daily_goal_ml | integer | not null |
| preferred_unit | text | not null, check `preferred_unit in ('ml', 'oz')`, default `'ml'` |
| reminder_enabled | boolean | default `true` |
| reminder_interval_hours | integer | default `2` |
| active_hours_start | time | default `07:00` |
| active_hours_end | time | default `23:00` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |

**RLS policies:**

| Policy | Rule |
| --- | --- |
| SELECT | `auth.uid() = id` |
| INSERT | `auth.uid() = id` |
| UPDATE | `auth.uid() = id` |
| DELETE | None (profiles are not user-deletable) |

### `water_logs`

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | FK → `profiles.id` on delete cascade, not null |
| amount_ml | integer | not null, check `amount_ml > 0` |
| logged_at | timestamptz | not null, default `now()` |
| created_at | timestamptz | default `now()` |

**Index:** `(user_id, logged_at)` for efficient daily queries.

**RLS policies:**

| Policy | Rule |
| --- | --- |
| SELECT | `auth.uid() = user_id` |
| INSERT | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

**Note:** The `streaks` table from earlier designs has been removed. Streaks are computed dynamically from `water_logs` (see section 4.7). This avoids sync issues and reduces write operations.

---

## 6. Key Screens

### 6.1 Landing Page (`/`)

- Simple product introduction with value proposition
- CTA to sign up or log in
- Only shown to unauthenticated users

### 6.2 Auth Page (`/login`)

- "Continue with Google" button
- "Continue as Guest" button
- Redirect to onboarding (first login) or dashboard on success

### 6.3 Onboarding (`/onboarding`)

- Shown once after first signup
- Collects name, weight, **preferred unit (ml/oz)**, and confirms calculated goal
- Redirects to dashboard on completion

### 6.4 Dashboard (`/dashboard`)

- Main hydration tracking interface (see section 4.5)
- Hydration Score displayed prominently at the top
- Progress ring, intake summary, quick-add buttons, and log timeline
- Default screen for authenticated users

### 6.5 Settings (`/settings`)

- Edit name, weight, daily goal
- **Unit preference** (ml or oz)
- Reminder preferences (toggle, interval, active hours)
- Account management (upgrade from guest, sign out)

### 6.6 History (`/history`) — optional for V1

- View past daily totals (in preferred unit) and Hydration Scores
- Calendar or list view of previous days
- Tap a day to see individual log entries

---

## 7. Non-Functional Requirements

### Performance

- Logging water (tap to saved) must complete in **< 1 second**
- Dashboard load time **< 2 seconds** on 3G connection
- Optimistic UI updates — reflect changes immediately, sync in background

### UX

- **Mobile-first** responsive design
- PWA-enabled: installable on home screen, offline-capable for viewing cached data
- Touch-friendly tap targets (minimum 44×44px)

### Security

- Authenticated user data protected via **Supabase Row Level Security (RLS)** — users can only read/write their own data (see policies in section 5)
- Guest data stored in localStorage only — no server-side exposure
- No sensitive data stored client-side beyond session tokens
- HTTPS enforced

### Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Sufficient color contrast (WCAG AA)

---

## 8. System Architecture

### High-Level Flow

```
Client (Next.js PWA)
    │
    ├── Auth ──→ Supabase Auth (Google OAuth)
    │
    ├── Data ──→ Supabase Postgres (profiles, water_logs)
    │              └── Protected by RLS policies
    │
    └── Offline ──→ Service Worker cache + localStorage
```

### Reminder Delivery

| Approach | Description |
| --- | --- |
| **Web Push (primary)** | Service worker subscribes to push; server sends via Web Push API |
| **Supabase Edge Function + Cron** | Scheduled function runs every N minutes, checks which users are behind pace, and triggers push notifications |
| **In-app fallback** | If push permission is denied, show in-app banner on next visit |

### PWA Offline Support

- Cache dashboard shell and static assets via service worker
- Store recent logs in localStorage for offline viewing
- Queue new logs offline and sync when connectivity returns (background sync)
- Hydration Score computes client-side — works fully offline

---

## 9. Success Metrics

| Metric | Description | Target (V1) |
| --- | --- | --- |
| Daily Active Users (DAU) | Unique users who open the app per day | Track baseline |
| Avg. logs per user per day | Number of water log entries per active user | ≥ 4 |
| Streak retention | % of users maintaining a streak ≥ 3 days | ≥ 30% |
| Reminder interaction rate | % of reminders that lead to a log within 15 min | ≥ 25% |
| Guest → Auth conversion | % of guest users who upgrade to Google login | ≥ 20% |
| Hydration Score engagement | % of DAU who view or reference their score | Track baseline |

---

## 10. Future Features (Not in V1)

| Feature | Description |
| --- | --- |
| Hydration Score sharing | Share daily score to social media or with friends |
| Gamification | Badges, levels, and achievements tied to score milestones and streaks |
| Daily Body Status | Dashboard cards for Hydration, Energy, and Recovery (self-reported) |
| Weather-based recommendations | Adjust daily goal based on temperature and humidity |
| Caffeine tracking | Log coffee/tea and factor dehydration effects |
| Health app integration | Sync with Apple Health / Google Fit |
| Hydration analytics | Weekly/monthly charts, score trends, and distribution insights |
| Social sharing | Share streaks or milestones |
| Beverage types | Track different drinks (water, tea, juice) with hydration multipliers |
| Export data | CSV/PDF export of hydration history |
