import { createClient, createAdminClient } from '@/lib/supabase/server'
import TeamsManager from '@/components/dashboard/TeamsManager'

export const dynamic = 'force-dynamic'

export default async function AdminTeamsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = user.user_metadata?.role || 'manager'

  const adminClient = createAdminClient()

  const { data: teams } = await adminClient
    .from('teams')
    .select('*, players(*), tournament:tournaments(id, name)')
    .order('name')

  const { data: tournaments } = await adminClient
    .from('tournaments')
    .select('id, name')
    .in('status', ['upcoming', 'active'])

  return <TeamsManager teams={teams || []} tournaments={tournaments || []} role={role} />
}
