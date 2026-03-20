import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicLiveView from '@/components/match/PublicLiveView'

export const dynamic = 'force-dynamic'

export default async function PublicMatchPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = createClient()
  const { token } = await params

  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*),
      tournament:tournaments(id, name, format, description),
      innings(*)
    `)
    .eq('share_token', token)
    .single()

  if (error || !match) notFound()

  const currentInnings = match.innings?.find((i: any) => i.innings_number === match.current_innings)
  const innings1 = match.innings?.find((i: any) => i.innings_number === 1)
  const innings2 = match.innings?.find((i: any) => i.innings_number === 2)

  // Fetch ALL balls for the match to compute full scorecards dynamically
  const inningsIds = match.innings?.map((i: any) => i.id) || []
  const { data: allBalls } = inningsIds.length > 0
    ? await supabase
        .from('balls')
        .select('id, innings_id, over_number, ball_number, runs, extras, extra_type, is_wicket, wicket_type, batsman_id, bowler_id, batsman:players!balls_batsman_id_fkey(name), bowler:players!balls_bowler_id_fkey(name)')
        .in('innings_id', inningsIds)
        .order('over_number', { ascending: false })
        .order('ball_number', { ascending: false })
    : { data: [] }

  return (
    <PublicLiveView
      match={match}
      currentInnings={currentInnings || null}
      innings1={innings1 || null}
      innings2={innings2 || null}
      allBalls={allBalls || []}
      token={token}
    />
  )
}
