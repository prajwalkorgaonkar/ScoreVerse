import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ''

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If next param is set (e.g. password reset), go there
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Otherwise route by role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const dest = profile?.role === 'super_admin'
          ? '/dashboard/admin'
          : '/dashboard/manager'

        return NextResponse.redirect(`${origin}${dest}`)
      }
    }
  }

  // Something went wrong — send to login with error flag
  return NextResponse.redirect(
    `${origin}/auth/login?error=auth_callback_failed`
  )
}
