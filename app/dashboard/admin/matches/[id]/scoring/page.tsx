import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import LiveScoring from '@/components/match/LiveScoring'
export const dynamic = 'force-dynamic'

export default async function AdminScoringPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: match } = await supabase
    .from('matches')
    .select(`*, team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*), innings(*)`)
    .eq('id', id).single()

  if (!match) notFound()

  const currentInnings = match.innings?.find((i: any) => i.innings_number === match.current_innings)

  const [{ data: matchPlayers }, { data: recentBalls }] = await Promise.all([
    supabase.from('match_players').select('*, player:players(*)').eq('match_id', id),
    supabase.from('balls').select('*').eq('innings_id', currentInnings?.id || '').order('over_number', { ascending: false }).order('ball_number', { ascending: false }).limit(30),
  ])

  return (
    <LiveScoring
      match={match}
      currentInnings={currentInnings || null}
      matchPlayers={matchPlayers || []}
      recentBalls={recentBalls || []}
      userId={user.id}
      role="super_admin"
    />
  )
}
