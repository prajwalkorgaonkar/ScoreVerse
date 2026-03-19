import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import TournamentDetail from '@/components/dashboard/TournamentDetail'
export const dynamic = 'force-dynamic'

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!tournament) notFound()

  const { data: teams } = await supabase
    .from('teams')
    .select('*, players(count)')
    .eq('tournament_id', params.id)
    .order('name')

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name, short_name, color),
      team2:teams!matches_team2_id_fkey(id, name, short_name, color),
      innings(*)
    `)
    .eq('tournament_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <TournamentDetail
      tournament={tournament}
      teams={teams || []}
      matches={matches || []}
      role={profile?.role || 'manager'}
    />
  )
}
