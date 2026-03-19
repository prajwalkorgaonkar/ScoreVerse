import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ManagersAdmin from '@/components/dashboard/ManagersAdmin'

export default async function ManagersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') redirect('/dashboard/manager')

  const { data: managers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return <ManagersAdmin managers={managers || []} currentUserId={user.id} />
}
