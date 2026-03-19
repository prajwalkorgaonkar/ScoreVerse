'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Swords, Share2, ExternalLink } from 'lucide-react'
import { formatMatchStatus } from '@/lib/utils'

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

export default function MatchesList({ matches, role }: Props) {
  const base = role === 'admin' ? '/dashboard/admin' : '/dashboard/manager'

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
        <div className="glass-card rounded-2xl py-20 text-center">
          <Swords size={40} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No matches yet</p>
          <p className="text-gray-600 text-sm mt-1 mb-6">Create your first match to get started</p>
          <Link
            href={`${base}/matches/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-medium rounded-xl transition-colors"
          >
            <Plus size={16} />
            Create Match
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map((match, i) => {
            const innings1 = match.innings?.find((inn: any) => inn.innings_number === 1)
            const innings2 = match.innings?.find((inn: any) => inn.innings_number === 2)
            const status = statusConfig[match.status] || statusConfig.scheduled

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-xl overflow-hidden hover:border-pitch-600/30 transition-colors group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
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
                          {innings1 && (
                            <div className="text-2xl font-display text-white mt-0.5">
                              {innings1.total_runs}/{innings1.total_wickets}
                              <span className="text-sm text-gray-500 ml-2 font-body">
                                ({innings1.total_overs}.{innings1.total_balls})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-gray-600 font-display text-sm">VS</div>

                        <div>
                          <div className="text-xl font-display" style={{ color: match.team2?.color || '#fff' }}>
                            {match.team2?.short_name || 'TBA'}
                          </div>
                          {innings2 && (
                            <div className="text-2xl font-display text-white mt-0.5">
                              {innings2.total_runs}/{innings2.total_wickets}
                              <span className="text-sm text-gray-500 ml-2 font-body">
                                ({innings2.total_overs}.{innings2.total_balls})
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
                    <div className="flex flex-col items-end gap-2">
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
