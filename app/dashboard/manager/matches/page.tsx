import { createClient } from '@/lib/supabase/server'
import MatchesList from '@/components/match/MatchesList'

export const dynamic = 'force-dynamic'

export default async function ManagerMatchesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name, short_name, color),
      team2:teams!matches_team2_id_fkey(id, name, short_name, color),
      tournament:tournaments(id, name),
      innings(id, innings_number, total_runs, total_wickets, total_overs, total_balls, is_completed)
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return <MatchesList matches={matches || []} role="manager" />
}
