-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║           CrickArena — Complete Database Schema                  ║
-- ║           Run this in Supabase SQL Editor                        ║
-- ╚═══════════════════════════════════════════════════════════════════╝

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════
-- PROFILES (extends auth.users)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('super_admin','manager')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- ══════════════════════════════════════════════
-- TOURNAMENTS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tournaments (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  format      TEXT NOT NULL DEFAULT 'T20' CHECK (format IN ('T20','ODI','Test','Custom')),
  status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed')),
  start_date  DATE NOT NULL,
  end_date    DATE,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournaments_select_all" ON tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_insert_auth" ON tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "tournaments_update_own" ON tournaments FOR UPDATE
  USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));
CREATE POLICY "tournaments_delete_admin" ON tournaments FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- ══════════════════════════════════════════════
-- TEAMS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS teams (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  short_name    TEXT NOT NULL,
  logo_url      TEXT,
  color         TEXT NOT NULL DEFAULT '#22c55e',
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_select_all" ON teams FOR SELECT USING (true);
CREATE POLICY "teams_modify_auth" ON teams FOR ALL USING (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════
-- PLAYERS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS players (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'batsman'
                  CHECK (role IN ('batsman','bowler','all_rounder','wicket_keeper')),
  team_id       UUID REFERENCES teams(id) ON DELETE CASCADE,
  jersey_number INTEGER,
  batting_style TEXT DEFAULT 'right_hand' CHECK (batting_style IN ('right_hand','left_hand')),
  bowling_style TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_select_all" ON players FOR SELECT USING (true);
CREATE POLICY "players_modify_auth" ON players FOR ALL USING (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════
-- MATCHES
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS matches (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id    UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team1_id         UUID REFERENCES teams(id),
  team2_id         UUID REFERENCES teams(id),
  total_overs      INTEGER NOT NULL DEFAULT 20,
  players_per_team INTEGER NOT NULL DEFAULT 11,
  venue            TEXT,
  status           TEXT NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','toss','live','innings_break','completed')),
  toss_winner_id   UUID REFERENCES teams(id),
  toss_choice      TEXT CHECK (toss_choice IN ('bat','bowl')),
  batting_team_id  UUID REFERENCES teams(id),
  bowling_team_id  UUID REFERENCES teams(id),
  current_innings  INTEGER NOT NULL DEFAULT 1 CHECK (current_innings IN (1,2)),
  share_token      TEXT UNIQUE NOT NULL,
  winner_team_id   UUID REFERENCES teams(id),
  win_by_runs      INTEGER,
  win_by_wickets   INTEGER,
  is_tie           BOOLEAN DEFAULT false,
  player_of_match  UUID REFERENCES players(id),
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select_all" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_modify_auth" ON matches FOR ALL USING (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════
-- INNINGS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS innings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id        UUID REFERENCES matches(id) ON DELETE CASCADE,
  batting_team_id UUID REFERENCES teams(id),
  bowling_team_id UUID REFERENCES teams(id),
  innings_number  INTEGER NOT NULL CHECK (innings_number IN (1,2)),
  total_runs      INTEGER NOT NULL DEFAULT 0,
  total_wickets   INTEGER NOT NULL DEFAULT 0,
  total_overs     INTEGER NOT NULL DEFAULT 0,
  total_balls     INTEGER NOT NULL DEFAULT 0,
  extras          INTEGER NOT NULL DEFAULT 0,
  wide_count      INTEGER NOT NULL DEFAULT 0,
  no_ball_count   INTEGER NOT NULL DEFAULT 0,
  bye_count       INTEGER NOT NULL DEFAULT 0,
  leg_bye_count   INTEGER NOT NULL DEFAULT 0,
  target          INTEGER,
  is_completed    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, innings_number)
);

ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "innings_select_all" ON innings FOR SELECT USING (true);
CREATE POLICY "innings_modify_auth" ON innings FOR ALL USING (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════
-- BALLS (delivery-by-delivery)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS balls (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  innings_id  UUID REFERENCES innings(id) ON DELETE CASCADE,
  over_number INTEGER NOT NULL,
  ball_number INTEGER NOT NULL,
  batsman_id  UUID REFERENCES players(id),
  bowler_id   UUID REFERENCES players(id),
  runs        INTEGER NOT NULL DEFAULT 0,
  extras      INTEGER NOT NULL DEFAULT 0,
  extra_type  TEXT CHECK (extra_type IN ('wide','no_ball','bye','leg_bye')),
  is_wicket   BOOLEAN DEFAULT false,
  wicket_type TEXT CHECK (wicket_type IN ('bowled','caught','lbw','run_out','stumped','hit_wicket')),
  fielder_id  UUID REFERENCES players(id),
  commentary  TEXT,
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "balls_select_all" ON balls FOR SELECT USING (true);
CREATE POLICY "balls_modify_auth" ON balls FOR ALL USING (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════
-- MATCH PLAYERS (selected Playing XI)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS match_players (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id      UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id     UUID REFERENCES players(id),
  team_id       UUID REFERENCES teams(id),
  batting_order INTEGER,
  is_captain    BOOLEAN DEFAULT false,
  is_keeper     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "match_players_select_all" ON match_players FOR SELECT USING (true);
CREATE POLICY "match_players_modify_auth" ON match_players FOR ALL USING (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ══════════════════════════════════════════════

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS matches_updated_at ON matches;
CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS innings_updated_at ON innings;
CREATE TRIGGER innings_updated_at BEFORE UPDATE ON innings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tournaments_updated_at ON tournaments;
CREATE TRIGGER tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════
-- REALTIME
-- ══════════════════════════════════════════════
-- Enable via Supabase Dashboard → Database → Replication → Tables
-- Toggle ON: balls, innings, matches
-- Do NOT run ALTER PUBLICATION commands manually.

-- ══════════════════════════════════════════════
-- FIRST SUPER ADMIN
-- ══════════════════════════════════════════════
-- After registering your first account, run:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
