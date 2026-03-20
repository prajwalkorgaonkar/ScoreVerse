import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { generateShareToken } from '@/lib/utils'

// GET /api/matches?status=&tournament_id=&my=true
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const status        = searchParams.get('status')
    const tournament_id = searchParams.get('tournament_id')
    const my            = searchParams.get('my') === 'true'
    const limit         = parseInt(searchParams.get('limit') || '20')
    const offset        = parseInt(searchParams.get('offset') || '0')
    const promoted      = searchParams.get('promoted') === 'true'

    let query = supabase
      .from('matches')
      .select(`
        id, status, total_overs, players_per_team, venue, current_innings, description,
        share_token, created_at, toss_winner_id, toss_choice,
        batting_team_id, bowling_team_id, is_promoted,
        winner_team_id, win_by_runs, win_by_wickets, is_tie,
        team1:teams!matches_team1_id_fkey(id, name, short_name, color),
        team2:teams!matches_team2_id_fkey(id, name, short_name, color),
        tournament:tournaments(id, name, format),
        innings(id, innings_number, total_runs, total_wickets, total_overs, total_balls, is_completed, target)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status)        query = query.eq('status', status)
    if (tournament_id) query = query.eq('tournament_id', tournament_id)
    if (promoted)      query = query.eq('is_promoted', true)

    if (my) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) query = query.eq('created_by', user.id)
    }

    const { data, error, count } = await query
    if (error) return err(error.message, 500)

    let matches = data || []
    return ok({ matches, total: count, limit, offset })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// POST /api/matches
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { tournament_id, team1_id, team2_id, total_overs, players_per_team, venue, description } = body

    if (!team1_id)              return err('team1_id is required')
    if (!team2_id)              return err('team2_id is required')
    if (team1_id === team2_id)  return err('team1 and team2 must be different')

    const overs   = parseInt(total_overs)   || 20
    const players = parseInt(players_per_team) || 11

    if (overs < 1 || overs > 50)     return err('total_overs must be between 1 and 50')
    if (players < 2 || players > 15) return err('players_per_team must be between 2 and 15')

    const supabase = createClient()

    // Verify teams exist
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .in('id', [team1_id, team2_id])

    if (!teams || teams.length < 2) return err('One or both teams not found', 404)

    const { data, error } = await supabase
      .from('matches')
      .insert({
        tournament_id: tournament_id || null,
        team1_id,
        team2_id,
        total_overs: overs,
        players_per_team: players,
        venue: venue?.trim() || null,
        description: description?.trim() || null,
        status: 'scheduled',
        current_innings: 1,
        share_token: generateShareToken(),
        created_by: user.id,
      })
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name, short_name, color),
        team2:teams!matches_team2_id_fkey(id, name, short_name, color),
        tournament:tournaments(id, name)
      `)
      .single()

    if (error) return err(error.message, 500)
    return ok({ match: data }, 201)
  } catch (e: any) {
    return err(e.message, 500)
  }
}
