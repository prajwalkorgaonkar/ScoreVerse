import { createClient } from '@/lib/supabase/server'
import CreateMatchForm from '@/components/match/CreateMatchForm'
export const dynamic = 'force-dynamic'

export default async function AdminNewMatchPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tournaments } = await supabase
    .from('tournaments').select('id, name, format').in('status', ['upcoming', 'active'])

  const { data: teams } = await supabase
    .from('teams').select('id, name, short_name, color, tournament_id').order('name')

  return (
    <CreateMatchForm
      tournaments={tournaments || []}
      teams={teams || []}
      userId={user.id}
      role="super_admin"
    />
  )
}
