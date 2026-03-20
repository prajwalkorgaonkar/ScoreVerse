import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ManagersAdmin from '@/components/dashboard/ManagersAdmin'

export const dynamic = 'force-dynamic'

export default async function ManagersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (user.user_metadata?.role !== 'super_admin') redirect('/dashboard/manager')

  const adminClient = createAdminClient()
  const { data: managers } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return <ManagersAdmin managers={managers || []} currentUserId={user.id} />
}
