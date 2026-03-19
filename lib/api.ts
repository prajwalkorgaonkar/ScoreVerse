/**
 * useApi — typed fetch wrapper for all CrickArena API routes.
 * Handles auth headers, JSON parsing, and error normalisation.
 */

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { data: null, error: json.error || `HTTP ${res.status}`, status: res.status }
    }
    return { data: json as T, error: null, status: res.status }
  } catch (e: any) {
    return { data: null, error: e.message || 'Network error', status: 0 }
  }
}

// ─── Tournaments ───────────────────────────────────────────────────────────

export const tournamentsApi = {
  list: (params?: { status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams(params as any).toString()
    return apiFetch<{ tournaments: any[]; total: number }>(`/api/tournaments${q ? `?${q}` : ''}`)
  },
  get: (id: string) => apiFetch<{ tournament: any }>(`/api/tournaments/${id}`),
  create: (body: Record<string, any>) =>
    apiFetch<{ tournament: any }>('/api/tournaments', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, any>) =>
    apiFetch<{ tournament: any }>(`/api/tournaments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/tournaments/${id}`, { method: 'DELETE' }),
}

// ─── Teams ─────────────────────────────────────────────────────────────────

export const teamsApi = {
  list: (params?: { tournament_id?: string; include_players?: boolean }) => {
    const q = new URLSearchParams(params as any).toString()
    return apiFetch<{ teams: any[] }>(`/api/teams${q ? `?${q}` : ''}`)
  },
  get: (id: string) => apiFetch<{ team: any }>(`/api/teams/${id}`),
  create: (body: Record<string, any>) =>
    apiFetch<{ team: any }>('/api/teams', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, any>) =>
    apiFetch<{ team: any }>(`/api/teams/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/teams/${id}`, { method: 'DELETE' }),
}

// ─── Players ───────────────────────────────────────────────────────────────

export const playersApi = {
  list: (params?: { team_id?: string; active?: boolean }) => {
    const q = new URLSearchParams(params as any).toString()
    return apiFetch<{ players: any[] }>(`/api/players${q ? `?${q}` : ''}`)
  },
  get: (id: string) => apiFetch<{ player: any; stats: any }>(`/api/players/${id}`),
  create: (body: Record<string, any>) =>
    apiFetch<{ player: any }>('/api/players', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, any>) =>
    apiFetch<{ player: any }>(`/api/players/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/players/${id}`, { method: 'DELETE' }),
}

// ─── Matches ───────────────────────────────────────────────────────────────

export const matchesApi = {
  list: (params?: { status?: string; tournament_id?: string; my?: boolean; limit?: number }) => {
    const q = new URLSearchParams(params as any).toString()
    return apiFetch<{ matches: any[]; total: number }>(`/api/matches${q ? `?${q}` : ''}`)
  },
  get: (id: string) => apiFetch<{ match: any }>(`/api/matches/${id}`),
  create: (body: Record<string, any>) =>
    apiFetch<{ match: any }>('/api/matches', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, any>) =>
    apiFetch<{ match: any }>(`/api/matches/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/matches/${id}`, { method: 'DELETE' }),

  // Toss
  recordToss: (id: string, body: { toss_winner_id: string; toss_choice: 'bat' | 'bowl' }) =>
    apiFetch<{ match: any; message: string }>(`/api/matches/${id}/toss`, {
      method: 'POST', body: JSON.stringify(body),
    }),

  // Start
  start: (id: string) =>
    apiFetch<{ message: string; innings: any }>(`/api/matches/${id}/start`, { method: 'POST' }),

  // Playing XI
  getPlayers: (id: string) => apiFetch<{ match_players: any[] }>(`/api/matches/${id}/players`),
  setPlayers: (id: string, body: { team1_players: string[]; team2_players: string[] }) =>
    apiFetch<{ match_players: any[]; message: string }>(`/api/matches/${id}/players`, {
      method: 'POST', body: JSON.stringify(body),
    }),

  // Public live view (no auth)
  getLive: (token: string) =>
    apiFetch<{ match: any; recent_balls: any[] }>(`/api/matches/live/${token}`),
}

// ─── Scoring ───────────────────────────────────────────────────────────────

export const scoringApi = {
  recordBall: (
    matchId: string,
    ball: {
      innings_id: string
      batsman_id: string
      bowler_id: string
      runs?: number
      extras?: number
      extra_type?: string | null
      is_wicket?: boolean
      wicket_type?: string | null
      fielder_id?: string | null
      commentary?: string | null
    }
  ) =>
    apiFetch<{
      ball: any
      innings: any
      next_state: 'continuing' | 'innings_break' | 'match_end'
      new_innings: any
      match_result: any
      over_completed: boolean
    }>(`/api/scoring/${matchId}/ball`, { method: 'POST', body: JSON.stringify(ball) }),

  undoBall: (matchId: string, innings_id: string) =>
    apiFetch<{ message: string; removed_ball: any; innings: any }>(
      `/api/scoring/${matchId}/ball`,
      { method: 'DELETE', body: JSON.stringify({ innings_id }) }
    ),

  getInningsScorecard: (matchId: string, inningsId: string) =>
    apiFetch<{
      innings: any
      balls: any[]
      batting_scorecard: any[]
      bowling_scorecard: any[]
      over_summary: any[]
    }>(`/api/scoring/${matchId}/innings/${inningsId}`),
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  me: () => apiFetch<{ user: any; profile: any }>('/api/auth/me'),
  signOut: () => apiFetch<{ message: string }>('/api/auth/signout', { method: 'POST' }),
}

// ─── Users (Super Admin only) ──────────────────────────────────────────────

export const usersApi = {
  list: (role?: string) => {
    const q = role ? `?role=${role}` : ''
    return apiFetch<{ users: any[]; total: number }>(`/api/users${q}`)
  },
}
