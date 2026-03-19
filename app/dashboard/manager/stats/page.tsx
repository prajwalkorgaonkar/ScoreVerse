import { createClient } from '@/lib/supabase/server'
import PlayerStats from '@/components/dashboard/PlayerStats'

export default async function StatsPage() {
  const supabase = createClient()

  // Get all balls with player info for stats calculation
  const { data: balls } = await supabase
    .from('balls')
    .select(`
      *,
      batsman:players!balls_batsman_id_fkey(id, name, role, team:teams(id, name, short_name, color)),
      bowler:players!balls_bowler_id_fkey(id, name, role, team:teams(id, name, short_name, color))
    `)
    .limit(2000)
    .order('timestamp', { ascending: false })

  return <PlayerStats balls={balls || []} />
}
