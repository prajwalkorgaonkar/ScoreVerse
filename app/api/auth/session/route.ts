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
      return NextResponse.json(
        { error: 'Your sign-in session could not be verified. Please sign in again.' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Failed to load profile after sign-in:', profileError)
      return NextResponse.json(
        { error: 'Unable to load your account profile. Please try again.' },
        { status: 500 }
      )
    }

    const destination = profile?.role === 'super_admin'
      ? '/dashboard/admin'
      : '/dashboard/manager'

    return NextResponse.json({ destination }, { status: 200 })
  } catch (error) {
    console.error('Failed to determine post-sign-in destination:', error)
    return NextResponse.json(
      { error: 'Unable to load your account. Please try again.' },
      { status: 500 }
    )
  }
}
