import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin, ok, err } from '@/lib/api-helpers'

// GET /api/tournaments/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        teams(
          id, name, short_name, color,
          players(id, name, role, jersey_number)
        ),
        matches(
          id, status, total_overs, created_at,
          team1:teams!matches_team1_id_fkey(id, name, short_name, color),
          team2:teams!matches_team2_id_fkey(id, name, short_name, color),
          innings(id, innings_number, total_runs, total_wickets, total_overs, total_balls)
        )
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) return err('Tournament not found', 404)
    return ok({ tournament: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// PATCH /api/tournaments/[id]  — update (authenticated users)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const allowed = ['name', 'description', 'format', 'status', 'start_date', 'end_date']
    const updates: Record<string, any> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) return err('No valid fields to update')

    const supabase = createClient()

    // Non-admins can only update their own tournaments
    if (user.role !== 'super_admin') {
      const { data: existing } = await supabase
        .from('tournaments')
        .select('created_by')
        .eq('id', resolvedParams.id)
        .single()
      if (existing?.created_by !== user.id) {
        return err('Forbidden: not your tournament', 403)
      }
    }

    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) return err(error.message, 500)
    return ok({ tournament: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// DELETE /api/tournaments/[id]  — Super Admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAdmin()
  if (authError) return authError

  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', resolvedParams.id)

    if (error) return err(error.message, 500)
    return ok({ message: 'Tournament deleted' })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
