import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/players/[id]  — includes computed stats from balls table
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()

    const [{ data: player }, { data: battingBalls }, { data: bowlingBalls }] = await Promise.all([
      supabase
        .from('players')
        .select('*, team:teams(id, name, short_name, color)')
        .eq('id', resolvedParams.id)
        .single(),
      supabase
        .from('balls')
        .select('runs, is_wicket, extra_type, extras')
        .eq('batsman_id', resolvedParams.id),
      supabase
        .from('balls')
        .select('runs, extras, is_wicket, wicket_type, extra_type')
        .eq('bowler_id', resolvedParams.id),
    ])

    if (!player) return err('Player not found', 404)

    // Compute batting stats
    const batting = {
      matches: 0,
      innings: battingBalls?.length ? 1 : 0,
      runs: 0, balls: 0, fours: 0, sixes: 0,
      dismissals: 0, not_outs: 0,
    }
    ;(battingBalls || []).forEach(b => {
      if (!b.extra_type || b.extra_type === 'no_ball') batting.balls++
      if (!b.extra_type) {
        batting.runs += b.runs
        if (b.runs === 4) batting.fours++
        if (b.runs === 6) batting.sixes++
      }
      if (b.is_wicket) batting.dismissals++
    })
    const batting_average = batting.dismissals > 0
      ? parseFloat((batting.runs / batting.dismissals).toFixed(2))
      : null
    const strike_rate = batting.balls > 0
      ? parseFloat(((batting.runs / batting.balls) * 100).toFixed(2))
      : 0

    // Compute bowling stats
    const bowling = {
      balls: 0, runs: 0, wickets: 0, wides: 0, no_balls: 0,
    }
    ;(bowlingBalls || []).forEach(b => {
      bowling.runs += b.runs + (b.extras || 0)
      if (!b.extra_type || b.extra_type === 'bye' || b.extra_type === 'leg_bye') bowling.balls++
      if (b.extra_type === 'wide') bowling.wides++
      if (b.extra_type === 'no_ball') bowling.no_balls++
      if (b.is_wicket && b.wicket_type !== 'run_out') bowling.wickets++
    })
    const overs = `${Math.floor(bowling.balls / 6)}.${bowling.balls % 6}`
    const economy = bowling.balls > 0
      ? parseFloat((bowling.runs / (bowling.balls / 6)).toFixed(2))
      : 0

    return ok({
      player,
      stats: {
        batting: { ...batting, average: batting_average, strike_rate },
        bowling: { ...bowling, overs, economy },
      },
    })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// PATCH /api/players/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const allowed = ['name', 'role', 'jersey_number', 'batting_style', 'bowling_style', 'is_active']
    const updates: Record<string, any> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) return err('No valid fields to update')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) return err(error.message, 500)
    return ok({ player: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// DELETE /api/players/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const supabase = createClient()
    const { error } = await supabase.from('players').delete().eq('id', resolvedParams.id)
    if (error) return err(error.message, 500)
    return ok({ message: 'Player deleted' })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
