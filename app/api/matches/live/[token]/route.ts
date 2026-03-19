import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ok, err } from '@/lib/api-helpers'

// GET /api/matches/live/[token]  — public, no auth required
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()

    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        id, status, total_overs, players_per_team, venue, current_innings,
        share_token, toss_choice,
        batting_team_id, bowling_team_id,
        winner_team_id, win_by_runs, win_by_wickets, is_tie,
        team1:teams!matches_team1_id_fkey(id, name, short_name, color),
        team2:teams!matches_team2_id_fkey(id, name, short_name, color),
        tournament:tournaments(id, name, format),
        toss_winner:teams!matches_toss_winner_id_fkey(id, name, short_name),
        innings(
          id, innings_number, batting_team_id, bowling_team_id,
          total_runs, total_wickets, total_overs, total_balls,
          extras, wide_count, no_ball_count, target, is_completed
        )
      `)
      .eq('share_token', resolvedParams.token)
      .single()

    if (error) return err('Match not found', 404)

    // Get recent balls for current innings
    const currentInnings = match.innings?.find((i: any) => i.innings_number === match.current_innings)
    let recentBalls: any[] = []

    if (currentInnings) {
      const { data: balls } = await supabase
        .from('balls')
        .select('id, over_number, ball_number, runs, extras, extra_type, is_wicket, wicket_type')
        .eq('innings_id', currentInnings.id)
        .order('over_number', { ascending: false })
        .order('ball_number', { ascending: false })
        .limit(36)

      recentBalls = balls || []
    }

    return ok({ match, recent_balls: recentBalls })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
