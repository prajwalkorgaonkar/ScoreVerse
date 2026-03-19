import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ok, err } from '@/lib/api-helpers'

// GET /api/scoring/[matchId]/innings/[inningsId]
// Returns full innings with computed batting + bowling scorecard
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string; inningsId: string }> }
) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()

    const { data: innings } = await supabase
      .from('innings')
      .select('*')
      .eq('id', resolvedParams.inningsId)
      .eq('match_id', resolvedParams.matchId)
      .single()

    if (!innings) return err('Innings not found', 404)

    const { data: balls } = await supabase
      .from('balls')
      .select(`
        id, over_number, ball_number, runs, extras, extra_type,
        is_wicket, wicket_type, commentary, timestamp,
        batsman:players!balls_batsman_id_fkey(id, name),
        bowler:players!balls_bowler_id_fkey(id, name),
        fielder:players!balls_fielder_id_fkey(id, name)
      `)
      .eq('innings_id', resolvedParams.inningsId)
      .order('over_number')
      .order('ball_number')

    const allBalls = balls || []

    // Build batting scorecard
    const batsmanMap: Record<string, any> = {}
    allBalls.forEach((ball: any) => {
      const batsman = Array.isArray(ball.batsman) ? ball.batsman[0] : ball.batsman
      const id = batsman?.id
      if (!id) return
      if (!batsmanMap[id]) {
        batsmanMap[id] = { player: batsman, runs: 0, balls: 0, fours: 0, sixes: 0, is_out: false, dismissal: null }
      }
      if (!ball.extra_type || ball.extra_type === 'no_ball') batsmanMap[id].balls++
      if (!ball.extra_type) {
        batsmanMap[id].runs += ball.runs
        if (ball.runs === 4) batsmanMap[id].fours++
        if (ball.runs === 6) batsmanMap[id].sixes++
      }
      if (ball.is_wicket) {
        batsmanMap[id].is_out = true
        batsmanMap[id].dismissal = ball.wicket_type
      }
    })

    const batting = Object.values(batsmanMap).map((b: any) => ({
      ...b,
      strike_rate: b.balls > 0 ? parseFloat(((b.runs / b.balls) * 100).toFixed(2)) : 0,
    }))

    // Build bowling scorecard
    const bowlerMap: Record<string, any> = {}
    allBalls.forEach((ball: any) => {
      const bowler = Array.isArray(ball.bowler) ? ball.bowler[0] : ball.bowler
      const id = bowler?.id
      if (!id) return
      if (!bowlerMap[id]) {
        bowlerMap[id] = { player: bowler, balls: 0, runs: 0, wickets: 0, wides: 0, no_balls: 0, maidens: 0 }
      }
      bowlerMap[id].runs += ball.runs + (ball.extras || 0)
      if (!ball.extra_type || ball.extra_type === 'bye' || ball.extra_type === 'leg_bye') bowlerMap[id].balls++
      if (ball.extra_type === 'wide')    bowlerMap[id].wides++
      if (ball.extra_type === 'no_ball') bowlerMap[id].no_balls++
      if (ball.is_wicket && ball.wicket_type !== 'run_out') bowlerMap[id].wickets++
    })

    const bowling = Object.values(bowlerMap).map((b: any) => ({
      ...b,
      overs: `${Math.floor(b.balls / 6)}.${b.balls % 6}`,
      economy: b.balls > 0 ? parseFloat((b.runs / (b.balls / 6)).toFixed(2)) : 0,
    }))

    // Group balls by over for over-by-over summary
    const overSummary: Record<number, any> = {}
    allBalls.forEach(ball => {
      const ov = ball.over_number
      if (!overSummary[ov]) overSummary[ov] = { over: ov + 1, runs: 0, wickets: 0, balls: [] }
      overSummary[ov].runs    += ball.runs + (ball.extras || 0)
      overSummary[ov].wickets += ball.is_wicket ? 1 : 0
      overSummary[ov].balls.push(ball)
    })

    return ok({
      innings,
      balls: allBalls,
      batting_scorecard: batting,
      bowling_scorecard: bowling,
      over_summary: Object.values(overSummary),
    })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
