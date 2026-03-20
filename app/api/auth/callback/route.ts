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

      // Otherwise route to homepage
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        return NextResponse.redirect(`${origin}/`)
      }
    }
  }

  // If PKCE fails due to strict browser cookie policies on localhost, 
  // the email is still verified natively on the backend. Divert to login with flag.
  return NextResponse.redirect(
    `${origin}/auth/login?error=auth_callback_failed&verified=true`
  )
}
