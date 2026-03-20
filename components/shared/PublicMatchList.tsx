'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PublicMatchCard from './PublicMatchCard'
import { Activity } from 'lucide-react'

export default function PublicMatchList({ initialMatches }: { initialMatches: any[] }) {
  const [matches, setMatches] = useState(initialMatches)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('public-match-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'innings' }, (payload: any) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const newData = payload.new
          setMatches(prev => prev.map(m => {
            if (m.id === newData.match_id) {
              const newInnings = m.innings ? [...m.innings] : []
              const idx = newInnings.findIndex((inn: any) => inn.id === newData.id)
              if (idx !== -1) {
                newInnings[idx] = { ...newInnings[idx], ...newData }
              } else {
                newInnings.push(newData)
              }
              return { ...m, innings: newInnings }
            }
            return m
          }))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          // New matches would ideally be fetched again or added if team/innings data was present
        }
        if (payload.eventType === 'UPDATE') {
          const newData = payload.new
          setMatches(prev => prev.map(m => m.id === newData.id ? { ...m, ...newData } : m))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'innings_break')
  const completedMatches = matches.filter(m => m.status === 'completed')
  const scheduledMatches = matches.filter(m => m.status === 'scheduled')

  return (
    <>
      {/* Live Section */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="live-dot" />
          <h2 className="text-2xl font-display text-white">Live Matches</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-crimson-500/20 text-crimson-400 text-xs font-bold font-mono">
            {liveMatches.length}
          </span>
        </div>
        
        {liveMatches.length === 0 ? (
          <div className="border border-arena-border border-dashed rounded-3xl p-12 text-center text-gray-500 bg-arena-card/30">
            <Activity size={32} className="mx-auto mb-4 opacity-50" />
            <p>No live matches currently in progress. Check back shortly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map(match => (
              <PublicMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-display text-white">Recent Results</h2>
        </div>
        
        {completedMatches.length === 0 ? (
          <div className="border border-arena-border border-dashed rounded-3xl p-12 text-center text-gray-500 bg-arena-card/30">
            <p>No completed matches logged yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedMatches.map(match => (
              <PublicMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Section */}
      {scheduledMatches.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-display text-white">Upcoming Matches</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduledMatches.map(match => (
              <PublicMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
