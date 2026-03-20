'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Loader2, Activity } from 'lucide-react'
import { matchesApi } from '@/lib/api'
import PublicMatchCard from './PublicMatchCard'
import { createClient } from '@/lib/supabase/client'

export default function HomeScoresSection() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    matchesApi.list({ limit: 3, promoted: 'true' })
      .then(({ data }) => setMatches(data?.matches || []))
      .finally(() => setLoading(false))

    // Real-time subscription with self-healing match identification
    const channel = supabase.channel('home-matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'innings' }, (payload: any) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setMatches(prev => prev.map(m => {
            // Self-healing: Match if match_id matches OR if we already have an innings with this ID
            const isMatch = m.id === payload.new.match_id || m.innings?.some((inn: any) => inn.id === payload.new.id)
            if (isMatch) {
              const newInnings = m.innings ? [...m.innings] : []
              const idx = newInnings.findIndex((inn: any) => inn.id === payload.new.id)
              if (idx !== -1) {
                newInnings[idx] = { ...newInnings[idx], ...payload.new }
              } else {
                newInnings.push(payload.new)
              }
              return { ...m, innings: newInnings }
            }
            return m
          }))
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload: any) => {
        setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'balls' }, (payload: any) => {
        const newBall = payload.new
        setMatches(prev => prev.map(m => {
          // Find if this ball belongs to any of our matches' innings
          const inningsToUpdate = m.innings?.find((inn: any) => inn.id === newBall.innings_id)
          if (inningsToUpdate) {
            const updatedInnings = m.innings.map((inn: any) => {
              if (inn.id === newBall.innings_id) {
                const existingBalls = inn.balls || []
                // Keep only last 6
                return { ...inn, balls: [newBall, ...existingBalls].slice(0, 6) }
              }
              return inn
            })
            return { ...m, innings: updatedInnings }
          }
          return m
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <section className="py-24 px-6 relative border-y border-arena-border/50 bg-arena-dark/50">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pitch-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pitch-600/10 border border-pitch-600/30 rounded-full text-pitch-400 text-xs font-bold tracking-wide uppercase mb-4">
              <span className="live-dot" />
              Live Arena
            </div>
            <h2 className="text-4xl font-display text-white">
              MATCH <span className="gradient-text">CENTRE</span>
            </h2>
          </div>
          
          <Link
            href="/scores"
            className="flex items-center gap-2 px-6 py-3 bg-arena-card border border-arena-border hover:border-pitch-500 text-white font-medium rounded-xl transition-all group"
          >
            <Activity size={18} className="text-pitch-400 group-hover:animate-pulse" />
            View All Scores
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-gray-400" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={32} className="text-pitch-500 animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-gray-500">
            <Activity size={32} className="mx-auto mb-4 opacity-50" />
            <p>No active or recent matches available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <PublicMatchCard match={match} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
