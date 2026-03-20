'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Swords, Share2, ExternalLink, Globe, Trash2, Loader2 } from 'lucide-react'
import { formatMatchStatus } from '@/lib/utils'
import { matchesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface Props {
  matches: any[]
  role: 'admin' | 'manager'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  live: { label: 'LIVE', className: 'text-crimson-400 bg-crimson-500/10 border-crimson-500/30' },
  scheduled: { label: 'Scheduled', className: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  toss: { label: 'Toss', className: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  innings_break: { label: 'Break', className: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  completed: { label: 'Done', className: 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20' },
}

export default function MatchesList({ matches: initMatches, role }: Props) {
  const [matches, setMatches] = useState(initMatches)
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const base = role === 'admin' ? '/dashboard/admin' : '/dashboard/manager'

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this match? All scorecard boundaries will be wiped.')) return
    setDeletingId(id)
    try {
      const { error } = await matchesApi.delete(id)
      if (error) throw new Error(error)
      setMatches(prev => prev.filter(m => m.id !== id))
      toast.success('Match permanently deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete match')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePromote = async (id: string, current: boolean) => {
    setPromotingId(id)
    try {
      const { error } = await matchesApi.update(id, { is_promoted: !current })
      if (error) throw new Error(error)
      setMatches(prev => prev.map(m => m.id === id ? { ...m, is_promoted: !current } : m))
      toast.success(current ? 'Removed from Home Page' : 'Broadcasted Live to Home Page!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update broadcast status')
    } finally {
      setPromotingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white tracking-wide">
            {role === 'admin' ? 'ALL ' : 'MY '}<span className="gradient-text">MATCHES</span>
          </h1>
          <p className="text-gray-500 mt-1">{matches.length} total matches</p>
        </div>
        <Link
          href={`${base}/matches/new`}
          className="flex items-center gap-2 px-5 py-2.5 bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Match
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="glass-card rounded-3xl py-24 text-center border-dashed border-2 border-arena-border relative overflow-hidden">
          <div className="absolute inset-0 bg-pitch-600/5 pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-pitch-600/10 flex items-center justify-center mx-auto mb-6 shadow-glow-green/20">
            <Swords size={48} className="text-pitch-400" />
          </div>
          <h3 className="text-2xl font-display text-white mb-2">No Matches Scheduled</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Your dashboard is currently empty. Start logging ball-by-ball actions by generating your very first match pipeline globally.
          </p>
          <Link
            href={`${base}/matches/new`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-pitch-600 hover:bg-pitch-500 text-white font-bold rounded-2xl transition-all shadow-glow-green hover:scale-105"
          >
            <Plus size={20} />
            Initialize First Match
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map((match, i) => {
            const t1Inn = match.innings?.find((inn: any) => inn.batting_team_id === match.team1?.id)
            const t2Inn = match.innings?.find((inn: any) => inn.batting_team_id === match.team2?.id)
            const status = statusConfig[match.status] || statusConfig.scheduled

            return (
              <motion.div key={match.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl overflow-hidden hover:border-pitch-600/30 transition-all border border-arena-border group">
                <div className="p-5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
                      {/* Teams & Score */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${status.className}`}>
                            {match.status === 'live' && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />
                            )}
                            {status.label}
                          </span>
                          {match.tournament && (
                            <span className="text-xs text-gray-500">{match.tournament.name}</span>
                          )}
                          <span className="text-xs text-gray-600">{match.total_overs} overs</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-xl font-display" style={{ color: match.team1?.color || '#fff' }}>
                              {match.team1?.short_name || 'TBA'}
                            </div>
                            {t1Inn && (
                              <div className="text-2xl font-display text-white mt-0.5">
                                {t1Inn.total_runs}/{t1Inn.total_wickets}
                                <span className="text-sm text-gray-500 ml-2 font-body">
                                  ({t1Inn.total_overs}.{t1Inn.total_balls})
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-sm font-display text-gray-500 pt-6 px-2">VS</div>

                          <div>
                            <div className="text-xl font-display" style={{ color: match.team2?.color || '#fff' }}>
                              {match.team2?.short_name || 'TBA'}
                            </div>
                            {t2Inn && (
                              <div className="text-2xl font-display text-white mt-0.5">
                                {t2Inn.total_runs}/{t2Inn.total_wickets}
                                <span className="text-sm text-gray-500 ml-2 font-body">
                                  ({t2Inn.total_overs}.{t2Inn.total_balls})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                      {match.status === 'completed' && match.winner_team_id && (
                        <div className="mt-2 text-xs text-pitch-400">
                          {match.winner_team_id === match.team1_id ? match.team1?.name : match.team2?.name} won
                          {match.win_by_runs ? ` by ${match.win_by_runs} runs` : ''}
                          {match.win_by_wickets ? ` by ${match.win_by_wickets} wickets` : ''}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-arena-border">
                      <Link
                        href={`${base}/matches/${match.id}${match.status === 'live' || match.status === 'toss' ? '/scoring' : ''}`}
                        className="flex items-center gap-2 px-4 py-2 bg-pitch-600/20 hover:bg-pitch-600/40 text-pitch-400 text-sm rounded-lg transition-colors"
                      >
                        {match.status === 'live' ? 'Score →' : 'Manage →'}
                      </Link>
                      <a
                        href={`/match/live/${match.share_token}`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <Share2 size={12} />
                        {match.share_token}
                        <ExternalLink size={10} />
                      </a>
                      <button
                        onClick={() => handlePromote(match.id, match.is_promoted)}
                        disabled={promotingId === match.id}
                        title={match.is_promoted ? "Unpublish from Global Home" : "Broadcast to Global Home"}
                        className={`p-2 rounded-lg transition-colors ${
                          match.is_promoted ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'text-gray-600 hover:text-white hover:bg-white/10'
                        } ${promotingId === match.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Globe size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(match.id)}
                        disabled={deletingId === match.id}
                        title="Delete Match"
                        className="p-2 text-gray-600 hover:text-crimson-400 hover:bg-crimson-500/10 rounded-lg transition-colors"
                      >
                        {deletingId === match.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
