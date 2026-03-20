import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminOverview from '@/components/dashboard/AdminOverview'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  if (user.user_metadata?.role !== 'super_admin') redirect('/dashboard/manager')

  const adminClient = createAdminClient()

  // Fetch all stats bypassing RLS to avoid recursive infinite policy loop
  const results = await Promise.all([
    adminClient.from('tournaments').select('*', { count: 'exact', head: true }),
    adminClient.from('matches').select('*', { count: 'exact', head: true }),
    adminClient.from('teams').select('*', { count: 'exact', head: true }),
    adminClient.from('players').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'manager'),
    adminClient.from('matches')
      .select('*, team1:teams!matches_team1_id_fkey(name, short_name, color), team2:teams!matches_team2_id_fkey(name, short_name, color)')
      .order('created_at', { ascending: false })
      .limit(5),
    adminClient.from('tournaments').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  // Log to terminal to detect any API or Postgres relation errors causing blank fields
  results.forEach((res, i) => {
    if (res.error) console.error(`Query ${i} failed:`, res.error)
  })

  const [
    { count: tournamentsCount },
    { count: matchesCount },
    { count: teamsCount },
    { count: playersCount },
    { count: managersCount },
    { data: recentMatches },
    { data: recentTournaments },
  ] = results

  return (
    <AdminOverview
      stats={{
        tournaments: tournamentsCount || 0,
        matches: matchesCount || 0,
        teams: teamsCount || 0,
        players: playersCount || 0,
        managers: managersCount || 0,
      }}
      recentMatches={recentMatches || []}
      recentTournaments={recentTournaments || []}
    />
  )
}
