import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateTournamentForm from '@/components/tournament/CreateTournamentForm'

export const dynamic = 'force-dynamic'

export default async function NewTournamentPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <CreateTournamentForm userId={user.id} />
    </div>
  )
}
