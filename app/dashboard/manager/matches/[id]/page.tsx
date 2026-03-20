import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MatchSetup from '@/components/match/MatchSetup'

export const dynamic = 'force-dynamic'

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name, short_name, color),
      team2:teams!matches_team2_id_fkey(id, name, short_name, color),
      tournament:tournaments(id, name),
      innings(*)
    `)
    .eq('id', id)
    .single()

  if (!match) notFound()

  // Redirect to scoring if live
  if (match.status === 'live') {
    const base = profile?.role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'
    redirect(`${base}/matches/${id}/scoring`)
  }

  // Get players for both teams
  const { data: team1Players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', match.team1_id)
    .eq('is_active', true)
    .order('name')

  const { data: team2Players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', match.team2_id)
    .eq('is_active', true)
    .order('name')

  const { data: matchPlayers } = await supabase
    .from('match_players')
    .select('*')
    .eq('match_id', id)

  return (
    <MatchSetup
      match={match}
      team1Players={team1Players || []}
      team2Players={team2Players || []}
      matchPlayers={matchPlayers || []}
      userId={user.id}
      role={profile?.role || 'manager'}
    />
  )
}
