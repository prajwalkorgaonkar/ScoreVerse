export type UserRole = 'super_admin' | 'manager' | 'public';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: 'T20' | 'ODI' | 'Test' | 'Custom';
  status: 'upcoming' | 'active' | 'completed';
  start_date: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  color: string;
  tournament_id: string;
  created_at: string;
  players?: Player[];
}

export interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all_rounder' | 'wicket_keeper';
  team_id: string;
  jersey_number?: number;
  batting_style?: 'right_hand' | 'left_hand';
  bowling_style?: string;
  stats?: PlayerStats;
}

export interface PlayerStats {
  matches: number;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  highest_score: number;
  average: number;
  strike_rate: number;
  wickets: number;
  overs_bowled: number;
  runs_conceded: number;
  economy: number;
  catches: number;
}

export interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  team1?: Team;
  team2?: Team;
  total_overs: number;
  players_per_team: number;
  venue?: string;
  status: 'scheduled' | 'toss' | 'live' | 'innings_break' | 'completed';
  toss_winner_id?: string;
  toss_choice?: 'bat' | 'bowl';
  batting_team_id?: string;
  bowling_team_id?: string;
  current_innings: 1 | 2;
  share_token: string;
  created_by: string;
  created_at: string;
  innings?: Innings[];
  result?: MatchResult;
}

export interface Innings {
  id: string;
  match_id: string;
  batting_team_id: string;
  bowling_team_id: string;
  innings_number: 1 | 2;
  total_runs: number;
  total_wickets: number;
  total_overs: number;
  total_balls: number;
  extras: number;
  is_completed: boolean;
  target?: number;
  balls?: Ball[];
}

export interface Ball {
  id: string;
  innings_id: string;
  over_number: number;
  ball_number: number;
  batsman_id: string;
  bowler_id: string;
  runs: number;
  extras: number;
  extra_type?: 'wide' | 'no_ball' | 'bye' | 'leg_bye';
  is_wicket: boolean;
  wicket_type?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket';
  fielder_id?: string;
  commentary?: string;
  timestamp: string;
}

export interface MatchResult {
  winner_team_id: string;
  win_by_runs?: number;
  win_by_wickets?: number;
  is_tie: boolean;
  player_of_match?: string;
}

export interface OverSummary {
  over_number: number;
  runs: number;
  wickets: number;
  balls: Ball[];
}

export interface BatsmanScore {
  player: Player;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  is_out: boolean;
  dismissal?: string;
  strike_rate: number;
}

export interface BowlerFigure {
  player: Player;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface PointsTableEntry {
  team: Team;
  played: number;
  won: number;
  lost: number;
  tied: number;
  no_result: number;
  points: number;
  nrr: number;
  runs_scored: number;
  overs_faced: number;
  runs_conceded: number;
  overs_bowled: number;
}

export interface LiveMatchState {
  match: Match;
  current_innings: Innings;
  batsmen: BatsmanScore[];
  current_bowler: BowlerFigure;
  last_5_overs: OverSummary[];
  required_run_rate?: number;
  current_run_rate: number;
  recent_balls: Ball[];
}
