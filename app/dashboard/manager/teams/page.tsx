import { createClient } from '@/lib/supabase/server'
import TeamsManager from '@/components/dashboard/TeamsManager'

export default async function ManagerTeamsPage() {
  const supabase = createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('*, players(*), tournament:tournaments(id, name)')
    .order('name')

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .in('status', ['upcoming', 'active'])

  return <TeamsManager teams={teams || []} tournaments={tournaments || []} role="manager" />
}
