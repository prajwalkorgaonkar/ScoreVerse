import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MatchScorecard from '@/components/match/MatchScorecard'

export default async function AdminScorecardPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select(`*, team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*), tournament:tournaments(id,name), innings(*)`)
    .eq('id', params.id).single()

  if (!match) notFound()

  const inningsIds = (match.innings || []).map((i: any) => i.id)
  let allBalls: any[] = []
  if (inningsIds.length > 0) {
    const { data: balls } = await supabase
      .from('balls')
      .select('*, batsman:players!balls_batsman_id_fkey(id, name), bowler:players!balls_bowler_id_fkey(id, name)')
      .in('innings_id', inningsIds)
      .order('over_number').order('ball_number')
    allBalls = balls || []
  }

  return <MatchScorecard match={match} innings={match.innings || []} balls={allBalls} role="super_admin" />
}
