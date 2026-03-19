'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'manager'
}

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user: sbUser } } = await supabase.auth.getUser()
    if (!sbUser) { setUser(null); setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', sbUser.id)
      .single()

    setUser(profile ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [load])

  const isAdmin   = user?.role === 'super_admin'
  const isManager = user?.role === 'manager'

  return { user, loading, isAdmin, isManager }
}
