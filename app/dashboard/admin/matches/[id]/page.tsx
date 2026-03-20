import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MatchSetup from '@/components/match/MatchSetup'
export const dynamic = 'force-dynamic'

export default async function AdminMatchDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: match } = await supabase
    .from('matches')
    .select(`*, team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*), tournament:tournaments(id,name), innings(*)`)
    .eq('id', id)
    .single()

  if (!match) notFound()

  if (match.status === 'live') redirect(`/dashboard/admin/matches/${id}/scoring`)

  const [{ data: team1Players }, { data: team2Players }, { data: matchPlayers }] = await Promise.all([
    supabase.from('players').select('*').eq('team_id', match.team1_id).eq('is_active', true).order('name'),
    supabase.from('players').select('*').eq('team_id', match.team2_id).eq('is_active', true).order('name'),
    supabase.from('match_players').select('*').eq('match_id', id),
  ])

  return (
    <MatchSetup
      match={match}
      team1Players={team1Players || []}
      team2Players={team2Players || []}
      matchPlayers={matchPlayers || []}
      userId={user.id}
      role="super_admin"
    />
  )
}
