import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'

const bebas = Bebas_Neue({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-display',
  display: 'swap' 
})

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-body',
  display: 'swap'
})

const mono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'ScoreVerse — Live Cricket Tournament Management',
  description: 'Premium cricket tournament management with live ball-by-ball scoring',
  keywords: 'cricket, tournament, live scoring, cricket management',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'ScoreVerse',
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
    <html lang="en" className={cn("dark", bebas.variable, dmSans.variable, mono.variable)} data-scroll-behavior="smooth">
      <head>
        {/* Fonts are now handled via next/font */}
      </head>
      <body className="noise-bg antialiased font-body">
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
