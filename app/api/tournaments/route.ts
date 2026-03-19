import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin, ok, err } from '@/lib/api-helpers'

// GET /api/tournaments  — list all tournaments (public read)
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')     // filter: upcoming | active | completed
    const limit  = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('tournaments')
      .select(`
        id, name, description, format, status,
        start_date, end_date, created_at,
        teams:teams(count),
        matches:matches(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) return err(error.message, 500)

    return ok({ tournaments: data, total: count, limit, offset })
  } catch (e: any) {
    return err(e.message, 500)
  }
}

// POST /api/tournaments  — create tournament (any authenticated user)
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, description, format, status, start_date, end_date } = body

    if (!name?.trim())       return err('name is required')
    if (!start_date)         return err('start_date is required')
    if (!['T20','ODI','Test','Custom'].includes(format)) return err('Invalid format')
    if (!['upcoming','active','completed'].includes(status ?? 'upcoming')) return err('Invalid status')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        format: format || 'T20',
        status: status || 'upcoming',
        start_date,
        end_date: end_date || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) return err(error.message, 500)
    return ok({ tournament: data }, 201)
  } catch (e: any) {
    return err(e.message, 500)
  }
}
