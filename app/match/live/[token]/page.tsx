import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicLiveView from '@/components/match/PublicLiveView'

export const dynamic = 'force-dynamic'

export default async function PublicMatchPage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*),
      tournament:tournaments(id, name, format),
      innings(*)
    `)
    .eq('share_token', params.token)
    .single()

  if (!match) notFound()

  const currentInnings = match.innings?.find((i: any) => i.innings_number === match.current_innings)
  const innings1 = match.innings?.find((i: any) => i.innings_number === 1)
  const innings2 = match.innings?.find((i: any) => i.innings_number === 2)

  // Fetch recent balls for the current innings
  const { data: recentBalls } = currentInnings?.id
    ? await supabase
        .from('balls')
        .select('id, over_number, ball_number, runs, extras, extra_type, is_wicket, wicket_type, batsman:players!balls_batsman_id_fkey(name), bowler:players!balls_bowler_id_fkey(name)')
        .eq('innings_id', currentInnings.id)
        .order('over_number', { ascending: false })
        .order('ball_number', { ascending: false })
        .limit(36)
    : { data: [] }

  return (
    <PublicLiveView
      match={match}
      currentInnings={currentInnings || null}
      innings1={innings1 || null}
      innings2={innings2 || null}
      recentBalls={recentBalls || []}
      token={params.token}
    />
  )
}
