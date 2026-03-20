import PublicNavbar from '@/components/shared/PublicNavbar'
import { ReactNode } from 'react'

export default function MatchLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen pb-20">
        {children}
      </main>
    </>
  )
}
