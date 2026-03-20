# 🏏 ScoreVerse

**Premium Cricket Tournament Management Platform**

> © 2024 ScoreVerse · All rights reserved to **Prajwal Korgaonkar**

Live ball-by-ball scoring · Role-based dashboards · Real-time public sharing · PDF scorecards

---

## 🚀 Deploy in 10 Minutes

### Step 1 — Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the full contents of `supabase-schema.sql` → click **Run**
3. Go to **Database → Replication → Tables** → enable Realtime on `balls`, `innings`, `matches`
4. Go to **Authentication → URL Configuration**:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/api/auth/callback`

### Step 2 — Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3 — Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4 — Create First Super Admin

Register via `/auth/register`, then run in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

### Step 5 — Deploy to Vercel

```bash
# Push to GitHub first
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/you/scoreverse.git
git push -u origin main
```

1. Go to [vercel.com](https://vercel.com) → Import project
2. Add all 4 environment variables in Vercel dashboard
3. Deploy!

---

## 🎭 Role System

| Role | Access |
|---|---|
| **Super Admin** | Full system — all tournaments, matches, users, analytics, settings |
| **Manager** | Create and score matches, manage teams and players |
| **Public** | View live match via share link — no login required |

---

## 📁 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Database + Auth | Supabase (PostgreSQL + GoTrue) |
| Realtime | Supabase Realtime |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| PDF Export | jsPDF + AutoTable |
| State | Zustand |

---

## 🔗 Key Routes

| Route | Access |
|---|---|
| `/` | Public landing page |
| `/auth/login` | Sign in |
| `/auth/register` | Create manager account |
| `/auth/forgot-password` | Request password reset |
| `/dashboard/admin` | Super Admin dashboard |
| `/dashboard/manager` | Manager dashboard |
| `/dashboard/manager/matches/new` | Create new match |
| `/dashboard/manager/matches/[id]` | Match setup + toss |
| `/dashboard/manager/matches/[id]/scoring` | Live scoring interface |
| `/dashboard/manager/matches/[id]/scorecard` | Full scorecard + PDF export |
| `/match/live/[token]` | Public live view (no login) |

---

## 🏏 Match Workflow

```
Create Match (4-step wizard)
  → Select Tournament
  → Choose Teams
  → Set Overs + Players
  → Review + Create

Match Setup
  → Select Playing XI (restricted to players_per_team)
  → Animated Coin Toss → Winner picks bat/bowl
  → Start Match

Live Scoring
  → Ball-by-ball: runs / extras / wickets
  → Undo last ball
  → Real-time updates to public viewers
  → Innings break → Set target → 2nd innings
  → Match end → Result displayed

Scorecard
  → Full batting + bowling card
  → Over-by-over summary
  → Export as branded PDF
  → Share link for public view
```

---

## 📊 API Reference

All endpoints require authentication except the public live view.

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/me` | GET | Current user + profile |
| `/api/tournaments` | GET, POST | List / create tournaments |
| `/api/tournaments/[id]` | GET, PATCH, DELETE | Tournament detail |
| `/api/tournaments/[id]/standings` | GET | Points table + NRR |
| `/api/teams` | GET, POST | List / create teams |
| `/api/teams/[id]` | GET, PATCH, DELETE | Team detail |
| `/api/players` | GET, POST | List / create players |
| `/api/players/[id]` | GET, PATCH, DELETE | Player + computed stats |
| `/api/matches` | GET, POST | List / create matches |
| `/api/matches/[id]` | GET, PATCH, DELETE | Match detail |
| `/api/matches/[id]/toss` | POST | Record toss |
| `/api/matches/[id]/start` | POST | Start match (validate XI) |
| `/api/matches/[id]/players` | GET, POST | Get / set Playing XI |
| `/api/matches/live/[token]` | GET | **Public** — no auth |
| `/api/scoring/[matchId]/ball` | POST | Record delivery |
| `/api/scoring/[matchId]/ball` | DELETE | Undo last delivery |
| `/api/scoring/[matchId]/innings/[id]` | GET | Full innings scorecard |
| `/api/users` | GET | List users (admin only) |
| `/api/users/[id]` | GET, PATCH, DELETE | User management |

---

© 2024 ScoreVerse · All rights reserved to **Prajwal Korgaonkar**
