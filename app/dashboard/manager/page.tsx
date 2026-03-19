import { createClient } from '@/lib/supabase/server'
import ManagerOverview from '@/components/dashboard/ManagerOverview'

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { count: matchesCount },
    { count: tournamentsCount },
    { data: liveMatches },
    { data: recentMatches },
  ] = await Promise.all([
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
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

  return (
    <ManagerOverview
      stats={{ matches: matchesCount || 0, tournaments: tournamentsCount || 0 }}
      liveMatches={liveMatches || []}
      recentMatches={recentMatches || []}
    />
  )
}
