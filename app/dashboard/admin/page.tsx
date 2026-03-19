import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminOverview from '@/components/dashboard/AdminOverview'

import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') redirect('/dashboard/manager')

  // Fetch all stats
  const results = await Promise.all([
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'manager'),
    supabase.from('matches')
      .select('*, team1:teams!matches_team1_id_fkey(name, short_name, color), team2:teams!matches_team2_id_fkey(name, short_name, color)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('tournaments').select('*').order('created_at', { ascending: false }).limit(5),
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
