import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/players?team_id=&active=true
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const team_id = searchParams.get('team_id')
    const active  = searchParams.get('active')

    let query = supabase
      .from('players')
      .select('*, team:teams(id, name, short_name, color)')
      .order('name')

    if (team_id) query = query.eq('team_id', team_id)
    if (active === 'true')  query = query.eq('is_active', true)
    if (active === 'false') query = query.eq('is_active', false)

    const { data, error } = await query
    if (error) return err(error.message, 500)
    return ok({ players: data })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// POST /api/players
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, role, team_id, jersey_number, batting_style, bowling_style } = body

    if (!name?.trim())  return err('name is required')
    if (!team_id)       return err('team_id is required')

    const VALID_ROLES = ['batsman', 'bowler', 'all_rounder', 'wicket_keeper']
    if (role && !VALID_ROLES.includes(role)) return err(`role must be one of: ${VALID_ROLES.join(', ')}`)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('players')
      .insert({
        name: name.trim(),
        role: role || 'batsman',
        team_id,
        jersey_number: jersey_number ? parseInt(jersey_number) : null,
        batting_style: batting_style || 'right_hand',
        bowling_style: bowling_style?.trim() || null,
        is_active: true,
      })
      .select('*, team:teams(id, name, short_name)')
      .single()

    if (error) return err(error.message, 500)
    return ok({ player: data }, 201)
  } catch (e: any) {
    return err(e.message, 500)
  }
}
