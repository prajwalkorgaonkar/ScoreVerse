import PublicNavbar from '@/components/shared/PublicNavbar'
import { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}
