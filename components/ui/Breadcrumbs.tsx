'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-2 text-xs font-medium">
      <Link 
        href="/" 
        className="text-gray-500 hover:text-white transition-colors"
      >
        <Home size={14} />
      </Link>
      
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        
        // Format segment: "matches" -> "Matches", "[id]" -> "Details"
        const label = segment.startsWith('[') 
          ? 'Details' 
          : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight size={12} className="text-gray-700" />
            <Link
              href={href}
              className={cn(
                "transition-colors",
                isLast ? "text-pitch-400 font-semibold" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
