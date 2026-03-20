import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type AuthedUser = { id: string; email: string; role: string }

/**
 * Returns the authenticated user + their profile role.
 * Returns a NextResponse error if unauthenticated.
 */
export async function requireAuth(): Promise<{ user: AuthedUser; error: null } | { user: null; error: NextResponse }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Fetch role from profiles table (source of truth) instead of user_metadata
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || user.user_metadata?.role || 'manager'

  return {
    user: { 
      id: user.id, 
      email: user.email || '', 
      role,
    },
    error: null,
  }
}

/**
 * Returns an error response if the user is not a super_admin.
 */
export async function requireAdmin(): Promise<{ user: AuthedUser; error: null } | { user: null; error: NextResponse }> {
  const result = await requireAuth()
  if (result.error) return result

  if (result.user.role !== 'super_admin') {
    return { user: null, error: NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 }) }
  }
  return result
}

export function ok(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
