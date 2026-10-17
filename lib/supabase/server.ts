import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createMockQueryChain() {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    order: () => chain,
    range: () => chain,
    limit: () => chain,
    single: async () => ({ data: null, error: null }),
    insert: () => chain,
    update: () => chain,
    patch: () => chain,
    delete: () => chain,
  }
  return chain
}

function createFallbackServerClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => createMockQueryChain(),
  } as any
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('⚠️ Supabase URL or Key missing in server context.')
    return createFallbackServerClient()
  }

  return createServerClient(url, key, {
    cookies: {
      async getAll() {
        const cookieStore = await cookies()
        return cookieStore.getAll()
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await cookies()
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component — safe to ignore
        }
      },
    },
  })
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn('⚠️ Supabase URL or Admin Key missing in server context.')
    return createFallbackServerClient()
  }

  return createServerClient(url, key, {
    cookies: {
      async getAll() { return [] },
      async setAll() {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
