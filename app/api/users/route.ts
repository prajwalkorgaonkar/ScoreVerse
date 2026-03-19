import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, ok, err } from '@/lib/api-helpers'

// GET /api/users  — Super Admin only
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')

    let query = supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })

    if (role) query = query.eq('role', role)

    const { data, error } = await query
    if (error) return err(error.message, 500)
    return ok({ users: data, total: data?.length || 0 })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
