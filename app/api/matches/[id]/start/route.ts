import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// POST /api/matches/[id]/start
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const supabase = createClient()

    // Fetch match
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (!match) return err('Match not found', 404)
    if (match.status === 'live') return err('Match already live')
    if (!match.toss_winner_id)   return err('Toss must be done before starting')

    // Check ownership
    if (user.role !== 'super_admin' && match.created_by !== user.id) {
      return err('Forbidden', 403)
    }

    // Verify Playing XI for both teams
    const { data: xi, count: xiCount } = await supabase
      .from('match_players')
      .select('*', { count: 'exact' })
      .eq('match_id', resolvedParams.id)

    const team1xi = (xi || []).filter(p => p.team_id === match.team1_id)
    const team2xi = (xi || []).filter(p => p.team_id === match.team2_id)

    if (team1xi.length < match.players_per_team || team2xi.length < match.players_per_team) {
      return err(`Each team must have exactly ${match.players_per_team} players selected`)
    }

    // Determine batting / bowling team from toss result
    const battingTeamId  = match.toss_choice === 'bat'
      ? match.toss_winner_id
      : (match.toss_winner_id === match.team1_id ? match.team2_id : match.team1_id)
    const bowlingTeamId  = battingTeamId === match.team1_id ? match.team2_id : match.team1_id

    // Update match to live
    const { error: matchErr } = await supabase
      .from('matches')
      .update({ status: 'live', batting_team_id: battingTeamId, bowling_team_id: bowlingTeamId })
      .eq('id', resolvedParams.id)

    if (matchErr) return err(matchErr.message, 500)

    // Create innings 1
    const { data: innings, error: innErr } = await supabase
      .from('innings')
      .insert({
        match_id: resolvedParams.id,
        batting_team_id: battingTeamId,
        bowling_team_id: bowlingTeamId,
        innings_number: 1,
        target: null,
      })
      .select()
      .single()

    if (innErr) return err(innErr.message, 500)

    return ok({ message: 'Match started!', innings })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
