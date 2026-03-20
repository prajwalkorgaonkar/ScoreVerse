import { createClient } from '@/lib/supabase/server'
import TeamsManager from '@/components/dashboard/TeamsManager'

export default async function ManagerTeamsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: teams } = await supabase
    .from('teams')
    .select('*, players(*), tournament:tournaments(id, name)')
    .eq('created_by', user.id)
    .order('name')

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .in('status', ['upcoming', 'active'])
    .eq('created_by', user.id)

  return <TeamsManager teams={teams || []} tournaments={tournaments || []} role="manager" />
}
