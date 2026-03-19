import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Called by the login page after signInWithPassword succeeds.
// Reads the session server-side (confirming the cookie is set),
// then returns the correct destination URL for the user's role.
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ destination: '/auth/login' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const destination = profile?.role === 'super_admin'
      ? '/dashboard/admin'
      : '/dashboard/manager'

    return NextResponse.json({ destination }, { status: 200 })
  } catch {
    return NextResponse.json({ destination: '/auth/login' }, { status: 500 })
  }
}
