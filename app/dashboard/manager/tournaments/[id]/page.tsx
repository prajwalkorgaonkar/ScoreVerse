import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import TournamentDetail from '@/components/dashboard/TournamentDetail'

export default async function ManagerTournamentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: tournament } = await supabase
    .from('tournaments').select('*').eq('id', params.id).single()
  if (!tournament) notFound()

  const { data: teams } = await supabase
    .from('teams').select('*, players(count)').eq('tournament_id', params.id).order('name')

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *, innings(*),
      team1:teams!matches_team1_id_fkey(id, name, short_name, color),
      team2:teams!matches_team2_id_fkey(id, name, short_name, color)
    `)
    .eq('tournament_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <TournamentDetail
      tournament={tournament}
      teams={teams || []}
      matches={matches || []}
      role="manager"
    />
  )
}
