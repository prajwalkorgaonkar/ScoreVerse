import { createClient } from '@/lib/supabase/server'
import CreateMatchForm from '@/components/match/CreateMatchForm'

export const dynamic = 'force-dynamic'

export default async function NewMatchPage({ params }: { params?: { role?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, format')
    .in('status', ['upcoming', 'active'])
    .order('created_at', { ascending: false })

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, short_name, color, tournament_id')
    .order('name')

  return (
    <CreateMatchForm
      tournaments={tournaments || []}
      teams={teams || []}
      userId={user.id}
      role={profile?.role || 'manager'}
    />
  )
}
