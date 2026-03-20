import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// POST /api/scoring/[matchId]/ball
// The core live-scoring engine — records one delivery and updates innings aggregates atomically.
export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const {
      innings_id,
      batsman_id,
      bowler_id,
      runs = 0,
      extras = 0,
      extra_type = null,     // 'wide' | 'no_ball' | 'bye' | 'leg_bye' | null
      is_wicket = false,
      wicket_type = null,    // 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket'
      fielder_id = null,
      commentary = null,
    } = body

    // --- Validation ---
    if (!innings_id)  return err('innings_id is required')
    if (!batsman_id)  return err('batsman_id is required')
    if (!bowler_id)   return err('bowler_id is required')

    const VALID_EXTRAS  = ['wide', 'no_ball', 'bye', 'leg_bye']
    const VALID_WICKETS = ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket']

    if (extra_type && !VALID_EXTRAS.includes(extra_type)) {
      return err(`extra_type must be one of: ${VALID_EXTRAS.join(', ')}`)
    }
    if (is_wicket && wicket_type && !VALID_WICKETS.includes(wicket_type)) {
      return err(`wicket_type must be one of: ${VALID_WICKETS.join(', ')}`)
    }
    if (runs < 0 || runs > 10)    return err('runs must be 0–10')
    if (extras < 0 || extras > 10) return err('extras must be 0–10')

    const supabase = createClient()

    // Fetch innings + match to validate state
    const { data: innings } = await supabase
      .from('innings')
      .select('*, match:matches(id, status, total_overs, players_per_team, created_by)')
      .eq('id', innings_id)
      .single()

    if (!innings)                        return err('Innings not found', 404)
    if (innings.is_completed)            return err('Innings is already completed')
    if (innings.match?.status !== 'live' && innings.match?.status !== 'innings_break') return err('Match is not active')
    if (innings.match_id !== resolvedParams.matchId) return err('Innings does not belong to this match')

    // Ownership check
    if (user.role !== 'super_admin' && innings.match?.created_by !== user.id) {
      return err('Forbidden', 403)
    }

    // Auto-resume from innings_break on first ball of new innings
    if (innings.match?.status === 'innings_break') {
      await supabase.from('matches').update({ status: 'live' }).eq('id', resolvedParams.matchId)
    }

    // A "legal" delivery (counts toward overs) unless it's a wide or no-ball
    const isLegalBall = !extra_type || extra_type === 'bye' || extra_type === 'leg_bye'

    // --- Insert ball ---
    const { data: ball, error: ballErr } = await supabase
      .from('balls')
      .insert({
        innings_id,
        over_number: innings.total_overs,
        ball_number: innings.total_balls,
        batsman_id,
        bowler_id,
        runs,
        extras: extra_type ? extras : 0,
        extra_type: extra_type || null,
        is_wicket,
        wicket_type: is_wicket ? (wicket_type || null) : null,
        fielder_id: fielder_id || null,
        commentary: commentary?.trim() || null,
      })
      .select()
      .single()

    if (ballErr) return err(ballErr.message, 500)

    // --- Update innings aggregates ---
    const runsThisBall   = runs + (extra_type ? extras : 0)
    const newBalls       = innings.total_balls + (isLegalBall ? 1 : 0)
    const overCompleted  = isLegalBall && newBalls === 6
    const newOvers       = overCompleted ? innings.total_overs + 1 : innings.total_overs
    const ballsReset     = overCompleted ? 0 : newBalls
    const newWickets     = innings.total_wickets + (is_wicket ? 1 : 0)
    const newRuns        = innings.total_runs + runsThisBall
    const newExtras      = innings.extras + (extra_type ? extras : 0)

    // Max wickets = players_per_team - 1 (last man standing)
    const maxWickets     = (innings.match?.players_per_team || 11) - 1
    const maxOvers       = innings.match?.total_overs || 20
    
    // Target reached check for Innings 2
    const targetReached  = innings.innings_number === 2 && innings.target && newRuns >= innings.target
    const isInningsOver  = newOvers >= maxOvers || newWickets >= maxWickets || targetReached

    // Extra type columns
    const extraCols: Record<string, any> = {}
    if (extra_type === 'wide')    extraCols.wide_count    = (innings.wide_count    || 0) + 1
    if (extra_type === 'no_ball') extraCols.no_ball_count = (innings.no_ball_count || 0) + 1
    if (extra_type === 'bye')     extraCols.bye_count     = (innings.bye_count     || 0) + 1
    if (extra_type === 'leg_bye') extraCols.leg_bye_count = (innings.leg_bye_count || 0) + 1

    const { data: updatedInnings, error: innErr } = await supabase
      .from('innings')
      .update({
        total_runs:    newRuns,
        total_wickets: newWickets,
        total_overs:   newOvers,
        total_balls:   ballsReset,
        extras:        newExtras,
        is_completed:  isInningsOver,
        ...extraCols,
      })
      .eq('id', innings_id)
      .select()
      .single()

    if (innErr) return err(innErr.message, 500)

    // --- Determine next state ---
    let nextState: 'continuing' | 'innings_break' | 'match_end' = 'continuing'
    let newInnings = null
    let matchResult = null

    if (isInningsOver) {
      if (innings.innings_number === 1) {
        nextState = 'innings_break'

        // Create innings 2 with target
        const target = newRuns + 1
        const { data: inn2, error: inn2Err } = await supabase
          .from('innings')
          .insert({
            match_id:        innings.match_id,
            batting_team_id: innings.bowling_team_id,
            bowling_team_id: innings.batting_team_id,
            innings_number:  2,
            target,
          })
          .select()
          .single()

        if (inn2Err) return err(inn2Err.message, 500)
        newInnings = inn2

        await supabase.from('matches').update({ status: 'innings_break', current_innings: 2 }).eq('id', resolvedParams.matchId)

      } else {
        // Innings 2 over → match ended
        nextState = 'match_end'
        const target = innings.target || 0

        let winnerTeamId: string
        let winByRuns = 0
        let winByWickets = 0
        let isTie = false

        if (newRuns >= target) {
          // Batting team won
          winnerTeamId  = innings.batting_team_id
          winByWickets  = maxWickets - newWickets
        } else if (newRuns < target - 1) {
          // Bowling team won
          winnerTeamId = innings.bowling_team_id
          winByRuns    = (target - 1) - newRuns
        } else {
          isTie        = true
          winnerTeamId = innings.bowling_team_id
        }

        await supabase.from('matches').update({
          status:          'completed',
          winner_team_id:  winnerTeamId,
          win_by_runs:     winByRuns || null,
          win_by_wickets:  winByWickets || null,
          is_tie:          isTie,
        }).eq('id', resolvedParams.matchId)

        matchResult = { winner_team_id: winnerTeamId, win_by_runs: winByRuns, win_by_wickets: winByWickets, is_tie: isTie }
      }
    }

    return ok({
      ball,
      innings: updatedInnings,
      next_state: nextState,
      new_innings: newInnings,
      match_result: matchResult,
      over_completed: overCompleted,
    })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// DELETE /api/scoring/[matchId]/ball  — undo last ball delivery
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { innings_id } = await req.json()
    if (!innings_id) return err('innings_id is required')

    const supabase = createClient()

    const { data: match } = await supabase
      .from('matches').select('id, status, created_by').eq('id', resolvedParams.matchId).single()

    if (!match)                        return err('Match not found', 404)
    const validStatuses = ['live', 'innings_break', 'completed']
    if (!validStatuses.includes(match.status)) return err('Match is not in a modifiable state')
    if (user.role !== 'super_admin' && match.created_by !== user.id) return err('Forbidden', 403)

    // Get last ball
    const { data: lastBall } = await supabase
      .from('balls').select('*').eq('innings_id', innings_id)
      .order('over_number', { ascending: false }).order('ball_number', { ascending: false })
      .limit(1).single()

    if (!lastBall) return err('No balls to undo')

    const { data: innings } = await supabase.from('innings').select('*').eq('id', innings_id).single()
    if (!innings) return err('Innings not found', 404)

    const wasLegal   = !lastBall.extra_type || lastBall.extra_type === 'bye' || lastBall.extra_type === 'leg_bye'
    const runsToUndo = lastBall.runs + (lastBall.extras || 0)
    let newBalls = innings.total_balls
    let newOvers = innings.total_overs
    if (wasLegal) {
      if (newBalls === 0 && newOvers > 0) { newOvers -= 1; newBalls = 5 }
      else newBalls -= 1
    }

    // --- Action: Delete the ball ---
    await supabase.from('balls').delete().eq('id', lastBall.id)

    // --- State Reversion: If this ball finished an innings/match ---
    if (match.status === 'innings_break' && innings.innings_number === 1) {
      // Revert from innings break: Delete Innings 2 and set match back to live
      await supabase.from('innings').delete().eq('match_id', match.id).eq('innings_number', 2)
      await supabase.from('matches').update({ status: 'live', current_innings: 1 }).eq('id', match.id)
    } else if (match.status === 'completed' && innings.innings_number === 2) {
      // Revert from completed: Set match back to live and clear results
      await supabase.from('matches').update({ 
        status: 'live', 
        winner_team_id: null, 
        win_by_runs: null, 
        win_by_wickets: null, 
        is_tie: false 
      }).eq('id', match.id)
    }

    const { data: updatedInnings } = await supabase
      .from('innings').update({
        total_runs:    Math.max(0, innings.total_runs    - runsToUndo),
        total_wickets: Math.max(0, innings.total_wickets - (lastBall.is_wicket ? 1 : 0)),
        total_overs:   newOvers,
        total_balls:   newBalls,
        extras:        Math.max(0, innings.extras - (lastBall.extra_type ? (lastBall.extras || 0) : 0)),
        is_completed:  false,
      }).eq('id', innings_id).select().single()

    return ok({ message: 'Last ball undone', removed_ball: lastBall, innings: updatedInnings })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
