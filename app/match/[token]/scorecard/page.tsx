import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MatchScorecard from '@/components/match/MatchScorecard'
import PublicNavbar from '@/components/shared/PublicNavbar'

export const dynamic = 'force-dynamic'

export default async function PublicMatchScorecardPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = createClient()
  const resolvedParams = await params

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*),
      tournament:tournaments(id, name),
      innings(*)
    `)
    .eq('share_token', resolvedParams.token)
    .single()

  if (!match) notFound()

  const inningsIds = (match.innings || []).map((i: any) => i.id)
  let allBalls: any[] = []
  if (inningsIds.length > 0) {
    const { data: balls } = await supabase
      .from('balls')
      .select('*, batsman:players!balls_batsman_id_fkey(id, name), bowler:players!balls_bowler_id_fkey(id, name)')
      .in('innings_id', inningsIds)
      .order('over_number')
      .order('ball_number')
    allBalls = balls || []
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pitch-500/30">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10 pt-24">
        <MatchScorecard
          match={match}
          innings={match.innings || []}
          balls={allBalls}
          role="public"
        />
      </main>
    </div>
  )
}
