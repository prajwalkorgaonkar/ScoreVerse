import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'CrickArena — Live Cricket Tournament Management',
  description: 'Premium cricket tournament management with live ball-by-ball scoring',
  keywords: 'cricket, tournament, live scoring, cricket management',
  openGraph: {
    title: 'CrickArena',
    description: 'Premium cricket tournament management platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="noise-bg antialiased">
        <div className="relative z-10">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f9fafb',
              border: '1px solid #1f2937',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#111827' },
            },
            error: {
              iconTheme: { primary: '#e11d48', secondary: '#111827' },
            },
          }}
        />
      </body>
    </html>
  )
}
