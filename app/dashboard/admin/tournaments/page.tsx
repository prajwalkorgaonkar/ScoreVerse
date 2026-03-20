import { createAdminClient } from '@/lib/supabase/server'
import TournamentsList from '@/components/dashboard/TournamentsList'

export default async function AdminTournamentsPage() {
  const supabase = createAdminClient()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      *,
      teams:teams(count),
      matches:matches(count)
    `)
    .order('created_at', { ascending: false })

  return <TournamentsList tournaments={tournaments || []} role="admin" />
}
