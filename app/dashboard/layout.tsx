import DashboardShell from '@/components/dashboard/DashboardShell'

export const dynamic = 'force-dynamic'

// No server-side auth check here - handled client-side in DashboardShell
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
