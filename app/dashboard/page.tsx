'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardRootPage() {
  useEffect(() => {
    const redirect = () => {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) {
          window.location.replace('/auth/login')
          return
        }
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            window.location.replace(
              profile?.role === 'super_admin'
                ? '/dashboard/admin'
                : '/dashboard/manager'
            )
          })
      })
    }
    redirect()
  }, [])

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-pitch-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
