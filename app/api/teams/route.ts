import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/teams?tournament_id=&include_players=true
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const tournament_id   = searchParams.get('tournament_id')
    const include_players = searchParams.get('include_players') === 'true'

    const selectFields = include_players
      ? '*, players(id, name, role, jersey_number, batting_style, bowling_style, is_active), tournament:tournaments(id, name)'
      : '*, tournament:tournaments(id, name)'

    let query = supabase
      .from('teams')
      .select(selectFields)
      .order('name')

    if (tournament_id) query = query.eq('tournament_id', tournament_id)

    const { data, error } = await query
    if (error) return err(error.message, 500)
    return ok({ teams: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// POST /api/teams
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, short_name, color, tournament_id } = body

    if (!name?.trim())       return err('name is required')
    if (!short_name?.trim()) return err('short_name is required')
    if (short_name.length > 4) return err('short_name must be 4 characters or fewer')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        short_name: short_name.trim().toUpperCase(),
        color: color || '#22c55e',
        tournament_id: tournament_id || null,
        created_by: user.id,
      })
      .select('*, tournament:tournaments(id, name)')
      .single()

    if (error) return err(error.message, 500)
    return ok({ team: data }, 201)
  } catch (e: any) {
    return err(e.message, 500)
  }
}
