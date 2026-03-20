import { createClient } from '@/lib/supabase/server'
import ManagerOverview from '@/components/dashboard/ManagerOverview'

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
  // Graceful configuration check
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border-crimson-500/50">
        <h2 className="text-xl font-display text-white mb-2">CONFIGURATION ERROR</h2>
        <p className="text-gray-400 text-sm">
          Supabase environment variables are missing in Vercel. 
          Please add <code className="text-crimson-400">NEXT_PUBLIC_SUPABASE_URL</code> and 
          <code className="text-crimson-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your Project Settings.
        </p>
      </div>
    )
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let results
  try {
    results = await Promise.all([
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
      supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
      supabase.from('matches')
        .select('*, team1:teams!matches_team1_id_fkey(name,short_name,color), team2:teams!matches_team2_id_fkey(name,short_name,color), innings(*)')
        .eq('status', 'live')
        .eq('created_by', user.id)
        .limit(3),
      supabase.from('matches')
        .select('*, team1:teams!matches_team1_id_fkey(name,short_name,color), team2:teams!matches_team2_id_fkey(name,short_name,color)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(8),
    ])
  } catch (err: any) {
    console.error("Manager Dashboard Fetch Failure:", err.message)
    throw err
  }

  const [mRes, tRes, lRes, rRes] = results

  return (
    <ManagerOverview
      stats={{ matches: mRes?.count || 0, tournaments: tRes?.count || 0 }}
      liveMatches={lRes?.data || []}
      recentMatches={rRes?.data || []}
    />
  )
}
