'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export default function PublicMatchSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentQ = searchParams.get('q') || ''
      if (query.trim() !== currentQ.trim()) {
        if (query.trim()) {
          router.push(`/scores?q=${encodeURIComponent(query.trim())}`)
        } else {
          router.push(`/scores`)
        }
      }
    }, 400) // 400ms debounce
    return () => clearTimeout(timeoutId)
  }, [query, router, searchParams])

  return (
    <div className="relative max-w-2xl mx-auto mb-12">
      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for teams, matches, or tournaments..."
        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-arena-card/60 border border-arena-border backdrop-blur-xl text-white placeholder-gray-500 focus:outline-none focus:border-pitch-500 transition-all shadow-lg hover:border-gray-500"
      />
    </div>
  )
}
