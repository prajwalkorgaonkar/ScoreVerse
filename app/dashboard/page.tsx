'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardRootPage() {
  useEffect(() => {
    const redirect = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single()
      window.location.href = profile?.role === 'super_admin'
        ? '/dashboard/admin'
        : '/dashboard/manager'
    }
    redirect()
  }, [])

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-pitch-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
