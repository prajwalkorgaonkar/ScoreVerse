import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/50 rounded-xl m-4 text-red-500 font-mono">
        <h1>AUTH FAILURE IN SERVER COMPONENT</h1>
        <p>Error: {error?.message || 'No user found in cookies'}</p>
        <p>Please log out and log back in to refresh your tokens.</p>
      </div>
    )
  }
  if (user.user_metadata?.role !== 'super_admin') redirect('/dashboard/manager')

  const adminClient = createAdminClient()
  const [
    { data: matchesByStatus },
    { data: recentBalls },
    { count: totalTournaments },
    { count: totalMatches },
    { count: totalPlayers },
  ] = await Promise.all([
    adminClient.from('matches').select('status'),
    adminClient.from('balls').select('runs, is_wicket, extra_type').limit(1000).order('timestamp', { ascending: false }),
    adminClient.from('tournaments').select('*', { count: 'exact', head: true }),
    adminClient.from('matches').select('*', { count: 'exact', head: true }),
    adminClient.from('players').select('*', { count: 'exact', head: true }),
  ])

  const runDist: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '6': 0, 'W': 0, 'Extras': 0 }
  ;(recentBalls || []).forEach((b: any) => {
    if (b.is_wicket) runDist['W']++
    else if (b.extra_type) runDist['Extras']++
    else if ([0,1,2,3,4,6].includes(b.runs)) runDist[String(b.runs)]++
  })

  const statusCounts = (matchesByStatus || []).reduce((acc: any, m: any) => {
    acc[m.status] = (acc[m.status] || 0) + 1
    return acc
  }, {})

  return (
    <AnalyticsDashboard
      runDistribution={runDist}
      matchStatusCounts={statusCounts}
      totalBalls={(recentBalls || []).length}
      globalStats={{
        tournaments: totalTournaments || 0,
        matches: totalMatches || 0,
        players: totalPlayers || 0,
      }}
    />
  )
}
