import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Always call getUser() — this refreshes the session
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Auth pages ──────────────────────────────────────────────────────────
  const AUTH_PAGES = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]
  const isAuthPage = AUTH_PAGES.some(p => pathname === p)

  // Redirect logged-in users away from auth pages
  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const dest = profile?.role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // ── Dashboard protection ─────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Super Admin only area
    if (pathname.startsWith('/dashboard/admin')) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard/manager', request.url))
      }
    }
  }

  return supabaseResponse
}
