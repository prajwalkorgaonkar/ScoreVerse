import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin, ok, err } from '@/lib/api-helpers'

// GET /api/teams/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        players(id, name, role, jersey_number, batting_style, bowling_style, is_active),
        tournament:tournaments(id, name, format)
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) return err('Team not found', 404)
    return ok({ team: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// PATCH /api/teams/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const allowed = ['name', 'short_name', 'color', 'logo_url', 'tournament_id']
    const updates: Record<string, any> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }
    if (updates.short_name) updates.short_name = updates.short_name.toUpperCase().slice(0, 4)

    if (Object.keys(updates).length === 0) return err('No valid fields to update')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) return err(error.message, 500)
    return ok({ team: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// DELETE /api/teams/[id]  — Super Admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  try {
    const supabase = createClient()
    const { error } = await supabase.from('teams').delete().eq('id', resolvedParams.id)
    if (error) return err(error.message, 500)
    return ok({ message: 'Team deleted' })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
