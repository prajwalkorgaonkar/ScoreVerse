import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin, ok, err } from '@/lib/api-helpers'

// GET /api/matches/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(*),
        team2:teams!matches_team2_id_fkey(*),
        tournament:tournaments(id, name, format),
        toss_winner:teams!matches_toss_winner_id_fkey(id, name, short_name),
        winner:teams!matches_winner_team_id_fkey(id, name, short_name, color),
        player_of_match_player:players!matches_player_of_match_fkey(id, name),
        innings(
          id, innings_number, batting_team_id, bowling_team_id,
          total_runs, total_wickets, total_overs, total_balls,
          extras, wide_count, no_ball_count, bye_count, leg_bye_count,
          target, is_completed
        )
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) return err('Match not found', 404)
    return ok({ match })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// PATCH /api/matches/[id]  — update match fields
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const allowed = [
      'status', 'toss_winner_id', 'toss_choice',
      'batting_team_id', 'bowling_team_id', 'current_innings',
      'winner_team_id', 'win_by_runs', 'win_by_wickets', 'is_tie',
      'venue', 'is_promoted', 'description'
    ]
    const updates: Record<string, any> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) return err('No valid fields to update')

    // Validate status transitions
    if (updates.status) {
      const VALID = ['scheduled', 'toss', 'live', 'innings_break', 'completed']
      if (!VALID.includes(updates.status)) return err(`status must be one of: ${VALID.join(', ')}`)
    }

    // Validate toss_choice
    if (updates.toss_choice && !['bat', 'bowl'].includes(updates.toss_choice)) {
      return err('toss_choice must be bat or bowl')
    }

    const adminClient = createAdminClient()

    // Check ownership (non-admins can only update own matches)
    if (user.role !== 'super_admin') {
      const { data: existing } = await adminClient
        .from('matches')
        .select('created_by')
        .eq('id', resolvedParams.id)
        .single()
      if (existing?.created_by !== user.id) return err('Forbidden', 403)
    }

    const { data, error } = await adminClient
      .from('matches')
      .update(updates)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) return err(error.message, 500)
    return ok({ match: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// DELETE /api/matches/[id]  — Super Admin or Match Creator
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const adminClient = createAdminClient()
    
    if (user.role !== 'super_admin') {
      const { data: existing } = await adminClient
        .from('matches')
        .select('created_by')
        .eq('id', resolvedParams.id)
        .single()
      if (existing?.created_by !== user.id) return err('Forbidden: You can only delete your own matches.', 403)
    }

    const { error } = await adminClient.from('matches').delete().eq('id', resolvedParams.id)
    if (error) return err(error.message, 500)
    return ok({ message: 'Match deleted' })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
