import { createClient } from '@/lib/supabase/server'
import MatchesList from '@/components/match/MatchesList'

export default async function AdminMatchesPage() {
  const supabase = createClient()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name, short_name, color),
      team2:teams!matches_team2_id_fkey(id, name, short_name, color),
      tournament:tournaments(id, name),
      innings(id, innings_number, total_runs, total_wickets, total_overs, total_balls, is_completed)
    `)
    .order('created_at', { ascending: false })

  return <MatchesList matches={matches || []} role="admin" />
}
