import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/matches/[id]/players  — get selected Playing XI
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('match_players')
      .select('*, player:players(id, name, role, jersey_number, batting_style, bowling_style)')
      .eq('match_id', resolvedParams.id)
      .order('batting_order')

    if (error) return err(error.message, 500)
    return ok({ match_players: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// POST /api/matches/[id]/players  — set Playing XI
// Body: { team1_players: string[], team2_players: string[] }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { team1_players, team2_players } = await req.json()

    if (!Array.isArray(team1_players) || !Array.isArray(team2_players)) {
      return err('team1_players and team2_players must be arrays of player IDs')
    }

    const supabase = createClient()

    const { data: match } = await supabase
      .from('matches')
      .select('id, team1_id, team2_id, players_per_team, created_by, status')
      .eq('id', resolvedParams.id)
      .single()

    if (!match) return err('Match not found', 404)
    if (match.status === 'live' || match.status === 'completed') {
      return err('Cannot change players after match has started')
    }
    if (user.role !== 'super_admin' && match.created_by !== user.id) {
      return err('Forbidden', 403)
    }

    if (team1_players.length !== match.players_per_team) {
      return err(`Team 1 must have exactly ${match.players_per_team} players`)
    }
    if (team2_players.length !== match.players_per_team) {
      return err(`Team 2 must have exactly ${match.players_per_team} players`)
    }

    // Verify all players belong to correct teams
    const allPlayerIds = [...team1_players, ...team2_players]
    const { data: players } = await supabase
      .from('players')
      .select('id, team_id')
      .in('id', allPlayerIds)

    const playerMap = Object.fromEntries((players || []).map(p => [p.id, p.team_id]))
    for (const pid of team1_players) {
      if (playerMap[pid] !== match.team1_id) return err(`Player ${pid} does not belong to team1`)
    }
    for (const pid of team2_players) {
      if (playerMap[pid] !== match.team2_id) return err(`Player ${pid} does not belong to team2`)
    }

    // Delete existing, re-insert
    await supabase.from('match_players').delete().eq('match_id', resolvedParams.id)

    const entries = [
      ...team1_players.map((pid: string, i: number) => ({
        match_id: resolvedParams.id, player_id: pid, team_id: match.team1_id, batting_order: i + 1,
      })),
      ...team2_players.map((pid: string, i: number) => ({
        match_id: resolvedParams.id, player_id: pid, team_id: match.team2_id, batting_order: i + 1,
      })),
    ]

    const { data, error } = await supabase
      .from('match_players')
      .insert(entries)
      .select('*, player:players(id, name, role)')

    if (error) return err(error.message, 500)
    return ok({ match_players: data, message: 'Playing XI saved!' })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
