import DashboardShell from '@/components/dashboard/DashboardShell'

// No server-side auth check here - handled client-side in DashboardShell
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
