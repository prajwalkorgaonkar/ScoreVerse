import { createClient } from '@/lib/supabase/server'
import TournamentsList from '@/components/dashboard/TournamentsList'

export default async function ManagerTournamentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, teams:teams(count), matches:matches(count)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return <TournamentsList tournaments={tournaments || []} role="manager" />
}
