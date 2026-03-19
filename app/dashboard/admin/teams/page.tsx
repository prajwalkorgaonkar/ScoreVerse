import { createClient } from '@/lib/supabase/server'
import TeamsManager from '@/components/dashboard/TeamsManager'

export const dynamic = 'force-dynamic'

export default async function AdminTeamsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const { data: teams } = await supabase
    .from('teams')
    .select('*, players(*), tournament:tournaments(id, name)')
    .order('name')

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .in('status', ['upcoming', 'active'])

  return <TeamsManager teams={teams || []} tournaments={tournaments || []} role={profile?.role || 'manager'} />
}
