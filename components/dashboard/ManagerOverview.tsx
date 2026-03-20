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
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Radio size={16} className="text-crimson-400 animate-pulse" />
              Live Matches
            </h2>
            <span className="text-[10px] bg-crimson-500/10 text-crimson-400 px-2 py-0.5 rounded-full border border-crimson-500/20 font-bold tracking-widest uppercase">
              Realtime
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((match) => {
              const currentInnings = match.innings?.find((i: any) => i.innings_number === match.current_innings)
              return (
                <Link
                  key={match.id}
                  href={`/dashboard/manager/matches/${match.id}/scoring`}
                  className="block glass-card rounded-2xl p-5 border border-crimson-500/10 hover:border-crimson-500/40 hover:shadow-glow-red transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Radio size={48} className="text-crimson-500" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="live-dot" />
                      <span className="text-crimson-400 text-[10px] font-bold tracking-widest uppercase">Live Now</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium bg-white/5 py-1 px-2 rounded-lg">
                      {match.total_overs} Ov
                    </span>
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: match.team1?.color || '#3b82f6' }} />
                         <span className="font-bold text-white tracking-wide">{match.team1?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: match.team2?.color || '#ef4444' }} />
                         <span className="font-bold text-white tracking-wide">{match.team2?.name}</span>
                      </div>
                    </div>
                    {currentInnings && (
                      <div className="text-right">
                        <div className="text-3xl font-display text-white group-hover:text-pitch-400 transition-colors">
                          {currentInnings.total_runs}/{currentInnings.total_wickets}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono tracking-tighter">
                          Over {currentInnings.total_overs}.{currentInnings.total_balls}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Recent matches table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl overflow-hidden border border-arena-border/50"
      >
        <div className="px-6 py-5 border-b border-arena-border/50 flex items-center justify-between bg-white/[0.01]">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            Match History
          </h3>
          <Link href="/dashboard/manager/matches" className="text-xs text-pitch-400 hover:text-pitch-300 font-medium flex items-center gap-1 group">
            View full history <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        {recentMatches.length === 0 ? (
          <div className="px-6 py-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pitch-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-pitch-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-pitch-500/20 shadow-glow-green/10">
                <Swords size={36} className="text-pitch-400 opacity-60" />
              </div>
              <h3 className="text-white font-display text-2xl tracking-wide mb-2">NO MATCHES YET</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                Your arena is waiting. Start by creating your first match and begin the scoring journey.
              </p>
              <Link
                href="/dashboard/manager/matches/new"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-bold rounded-xl transition-all shadow-glow-green active:scale-95"
              >
                <Plus size={18} />
                Create First Match
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="arena-table">
              <thead>
                <tr>
                  <th className="pl-6">Matchup</th>
                  <th>Overs</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((match) => (
                  <tr key={match.id} className="group transition-colors">
                    <td className="pl-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white tracking-wide">{match.team1?.short_name}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest italic">vs</span>
                          <span className="font-semibold text-white tracking-wide">{match.team2?.short_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-400 font-medium font-mono text-xs">{match.total_overs} OV</td>
                    <td>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-wider ${
                        match.status === 'live' ? 'text-crimson-400 bg-crimson-500/10 border-crimson-500/30' :
                        match.status === 'completed' ? 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20' :
                        'text-gray-400 bg-gray-500/10 border-gray-500/20'
                      }`}>
                        {formatMatchStatus(match.status)}
                      </span>
                    </td>
                    <td className="text-gray-500 text-xs font-medium">
                      {new Date(match.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-right pr-6">
                      <Link
                        href={`/dashboard/manager/matches/${match.id}${match.status === 'live' ? '/scoring' : ''}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-pitch-600/20 text-pitch-400 hover:text-pitch-300 text-xs font-bold rounded-lg transition-all border border-transparent hover:border-pitch-600/30"
                      >
                        Manage <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
