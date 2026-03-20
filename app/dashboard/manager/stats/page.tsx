import { createClient } from '@/lib/supabase/server'
import PlayerStats from '@/components/dashboard/PlayerStats'

export default async function StatsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Get all matches created by this manager
  const { data: myMatches } = await supabase.from('matches').select('id').eq('created_by', user.id)
  const matchIds = myMatches?.map(m => m.id) || []

  // 2. Get all innings for those matches
  const { data: myInnings } = await supabase.from('innings').select('id').in('match_id', matchIds)
  const inningsIds = myInnings?.map(i => i.id) || []

  if (inningsIds.length === 0) {
    return <PlayerStats balls={[]} />
  }

  // 3. Get all balls for those innings to calculate stats locally
  const { data: balls } = await supabase
    .from('balls')
    .select(`
      *,
      batsman:players!balls_batsman_id_fkey(id, name, role, team:teams(id, name, short_name, color)),
      bowler:players!balls_bowler_id_fkey(id, name, role, team:teams(id, name, short_name, color))
    `)
    .in('innings_id', inningsIds)
    .limit(2000)
    .order('timestamp', { ascending: false })

  return <PlayerStats balls={balls || []} />
}
