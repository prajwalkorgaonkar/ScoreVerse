import { createBrowserClient } from '@supabase/ssr'

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

function createFallbackClient() {
  const channel: any = {
    on: () => channel,
    subscribe: async () => ({ data: { subscription: { unsubscribe() {} } }, error: null }),
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => createMockQueryChain(),
    channel: () => channel,
    removeChannel: () => undefined,
  } as any
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Supabase environment variables are missing during server-side execution/build.')
    }
    return createFallbackClient()
  }

  return createBrowserClient(url, key)
}
