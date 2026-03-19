'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Swords, Trophy, Plus, ChevronRight, Radio, Clock } from 'lucide-react'
import { formatMatchStatus } from '@/lib/utils'

interface Props {
  stats: { matches: number; tournaments: number }
  liveMatches: any[]
  recentMatches: any[]
}

export default function ManagerOverview({ stats, liveMatches, recentMatches }: Props) {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white tracking-wide">MATCH <span className="gradient-text">CONTROL</span></h1>
          <p className="text-gray-500 mt-1">Manage your matches and scoring</p>
        </div>
        <Link
          href="/dashboard/manager/matches/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Match
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'My Matches', value: stats.matches, icon: Swords, color: 'text-pitch-400', bg: 'bg-pitch-500/10', border: 'border-pitch-500/20' },
          { label: 'Tournaments', value: stats.tournaments, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card rounded-xl p-6 border ${card.border}`}
          >
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div className="text-4xl font-display text-white">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Radio size={16} className="text-crimson-400 animate-pulse" />
            Live Now
          </h2>
          {liveMatches.map((match) => {
            const currentInnings = match.innings?.find((i: any) => i.innings_number === match.current_innings)
            return (
              <Link
                key={match.id}
                href={`/dashboard/manager/matches/${match.id}/scoring`}
                className="block glass-card rounded-xl p-5 border border-crimson-500/20 hover:border-crimson-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="live-dot" />
                    <span className="text-crimson-400 text-xs font-semibold">LIVE</span>
                  </div>
                  <span className="text-xs text-gray-500">{match.total_overs} overs</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">
                      <span style={{ color: match.team1?.color }}>{match.team1?.short_name}</span>
                      <span className="text-gray-500 mx-2">vs</span>
                      <span style={{ color: match.team2?.color }}>{match.team2?.short_name}</span>
                    </div>
                  </div>
                  {currentInnings && (
                    <div className="text-right">
                      <div className="text-2xl font-display text-white">
                        {currentInnings.total_runs}/{currentInnings.total_wickets}
                      </div>
                      <div className="text-xs text-gray-500">
                        {currentInnings.total_overs}.{currentInnings.total_balls} ov
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </motion.div>
      )}

      {/* Recent matches table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-arena-border flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            Recent Matches
          </h3>
          <Link href="/dashboard/manager/matches" className="text-xs text-pitch-400 hover:text-pitch-300 flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        {recentMatches.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Swords size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No matches yet</p>
            <Link
              href="/dashboard/manager/matches/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={14} />
              Create First Match
            </Link>
          </div>
        ) : (
          <table className="arena-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Overs</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentMatches.map((match) => (
                <tr key={match.id}>
                  <td>
                    <span style={{ color: match.team1?.color }} className="font-medium">{match.team1?.short_name}</span>
                    <span className="text-gray-500 mx-2">vs</span>
                    <span style={{ color: match.team2?.color }} className="font-medium">{match.team2?.short_name}</span>
                  </td>
                  <td className="text-gray-400">{match.total_overs}</td>
                  <td>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                      match.status === 'live' ? 'text-crimson-400 bg-crimson-500/10 border-crimson-500/30' :
                      match.status === 'completed' ? 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20' :
                      'text-gray-400 bg-gray-500/10 border-gray-500/20'
                    }`}>
                      {formatMatchStatus(match.status)}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs">{new Date(match.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link
                      href={`/dashboard/manager/matches/${match.id}${match.status === 'live' ? '/scoring' : ''}`}
                      className="text-pitch-400 hover:text-pitch-300 text-xs"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
