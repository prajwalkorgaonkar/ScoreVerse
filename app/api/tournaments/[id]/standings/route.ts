import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ok, err } from '@/lib/api-helpers'
import { calculateNRR } from '@/lib/utils'

// GET /api/tournaments/[id]/standings
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()

    const [{ data: teams }, { data: matches }] = await Promise.all([
      supabase.from('teams').select('id, name, short_name, color').eq('tournament_id', resolvedParams.id),
      supabase
        .from('matches')
        .select('id, team1_id, team2_id, winner_team_id, is_tie, innings(*)')
        .eq('tournament_id', resolvedParams.id)
        .eq('status', 'completed'),
    ])

    if (!teams) return err('Tournament not found', 404)

    const table = teams.map(team => {
      const teamMatches = (matches || []).filter(m => m.team1_id === team.id || m.team2_id === team.id)
      const won    = teamMatches.filter(m => m.winner_team_id === team.id).length
      const lost   = teamMatches.filter(m => m.winner_team_id && m.winner_team_id !== team.id && !m.is_tie).length
      const tied   = teamMatches.filter(m => m.is_tie).length
      const played = teamMatches.length
      const points = won * 2 + tied

      let runsScored = 0, oversFaced = 0, runsConceded = 0, oversBowled = 0
      teamMatches.forEach(m => {
        const battingInns = (m.innings || []).find((inn: any) => inn.batting_team_id === team.id)
        const bowlingInns = (m.innings || []).find((inn: any) => inn.bowling_team_id === team.id)
        if (battingInns) {
          runsScored += battingInns.total_runs
          oversFaced += battingInns.total_overs + battingInns.total_balls / 6
        }
        if (bowlingInns) {
          runsConceded += bowlingInns.total_runs
          oversBowled  += bowlingInns.total_overs + bowlingInns.total_balls / 6
        }
      })

      const nrr = calculateNRR(runsScored, oversFaced, runsConceded, oversBowled)

      return { team, played, won, lost, tied, no_result: 0, points, nrr, runsScored, oversFaced, runsConceded, oversBowled }
    })

    // Sort by points desc, then NRR desc
    table.sort((a, b) => b.points - a.points || b.nrr - a.nrr)

    return ok({ standings: table, tournament_id: resolvedParams.id })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
