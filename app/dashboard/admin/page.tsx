import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminOverview from '@/components/dashboard/AdminOverview'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  if (user.user_metadata?.role !== 'super_admin') redirect('/dashboard/manager')

  const adminClient = createAdminClient()
  
  // Verify admin client readiness
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border-crimson-500/50">
        <h2 className="text-xl font-display text-white mb-2">CONFIGURATION ERROR</h2>
        <p className="text-gray-400 text-sm">
          The <code className="text-crimson-400">SUPABASE_SERVICE_ROLE_KEY</code> is missing in your Vercel Environment Variables. 
          This is required for the Admin Dashboard to bypass security policies.
        </p>
      </div>
    )
  }

  // Fetch all stats bypassing RLS to avoid recursive infinite policy loop
  let results
  try {
    results = await Promise.all([
      adminClient.from('tournaments').select('*', { count: 'exact', head: true }),
      adminClient.from('matches').select('*', { count: 'exact', head: true }),
      adminClient.from('teams').select('*', { count: 'exact', head: true }),
      adminClient.from('players').select('*', { count: 'exact', head: true }),
      adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'manager'),
      adminClient.from('matches')
        .select('*, team1:teams!matches_team1_id_fkey(name, short_name, color), team2:teams!matches_team2_id_fkey(name, short_name, color)')
        .order('created_at', { ascending: false })
        .limit(5),
      adminClient.from('tournaments').select('*').order('created_at', { ascending: false }).limit(5),
    ])
  } catch (err: any) {
    console.error("Critical Failure in Admin Dashboard fetch:", err.message)
    throw err // Let the Next.js error boundary handle it, or we could return a custom UI
  }

  // Log to terminal to detect any API or Postgres relation errors causing blank fields
  results.forEach((res, i) => {
    if (res.error) console.error(`Query ${i} failed:`, res.error)
  })

  // Destructure safely
  const [
    tRes,
    mRes,
    tmRes,
    pRes,
    mgRes,
    rmRes,
    rtRes
  ] = results

  return (
    <AdminOverview
      stats={{
        tournaments: tRes?.count || 0,
        matches: mRes?.count || 0,
        teams: tmRes?.count || 0,
        players: pRes?.count || 0,
        managers: mgRes?.count || 0,
      }}
      recentMatches={rmRes?.data || []}
      recentTournaments={rtRes?.data || []}
    />
  )
}
