'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy, Swords, Users, UserCog, BarChart3,
  TrendingUp, Circle, Plus, ChevronRight, Activity
} from 'lucide-react'
import { formatMatchStatus } from '@/lib/utils'

interface Props {
  stats: {
    tournaments: number
    matches: number
    teams: number
    players: number
    managers: number
  }
  recentMatches: any[]
  recentTournaments: any[]
}

const statCards = (stats: Props['stats']) => [
  { label: 'Tournaments', value: stats.tournaments, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', href: '/dashboard/admin/tournaments' },
  { label: 'Total Matches', value: stats.matches, icon: Swords, color: 'text-pitch-400', bg: 'bg-pitch-500/10', border: 'border-pitch-500/20', href: '/dashboard/admin/matches' },
  { label: 'Teams', value: stats.teams, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', href: '/dashboard/admin/teams' },
  { label: 'Players', value: stats.players, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', href: '/dashboard/admin/teams' },
  { label: 'Managers', value: stats.managers, icon: UserCog, color: 'text-crimson-400', bg: 'bg-crimson-500/10', border: 'border-crimson-500/20', href: '/dashboard/admin/managers' },
]

const statusColors: Record<string, string> = {
  live: 'text-crimson-400 bg-crimson-500/10 border-crimson-500/30',
  scheduled: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  completed: 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20',
  innings_break: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  toss: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default function AdminOverview({ stats, recentMatches, recentTournaments }: Props) {
  const cards = statCards(stats)

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white tracking-wide">ADMIN <span className="gradient-text">OVERVIEW</span></h1>
          <p className="text-gray-500 mt-1">Full system control — God Mode active</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-sm font-medium">Super Admin</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={card.href}
              className={`block p-5 glass-card rounded-xl border ${card.border} hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className="text-3xl font-display text-white">{card.value}</div>
              <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'New Tournament', href: '/dashboard/admin/tournaments/new', icon: Plus, color: 'bg-amber-600 hover:bg-amber-500' },
          { label: 'Create Match', href: '/dashboard/admin/matches/new', icon: Swords, color: 'bg-pitch-600 hover:bg-pitch-500' },
          { label: 'Add Team', href: '/dashboard/admin/teams/new', icon: Users, color: 'bg-blue-600 hover:bg-blue-500' },
          { label: 'Add Manager', href: '/dashboard/admin/managers/new', icon: UserCog, color: 'bg-purple-600 hover:bg-purple-500' },
        ].map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
          >
            <Link
              href={action.href}
              className={`flex items-center gap-3 px-4 py-3 ${action.color} text-white text-sm font-medium rounded-xl transition-colors`}
            >
              <action.icon size={16} />
              {action.label}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-arena-border flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Swords size={16} className="text-pitch-400" />
              Recent Matches
            </h3>
            <Link href="/dashboard/admin/matches" className="text-xs text-pitch-400 hover:text-pitch-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-arena-border/50">
            {recentMatches.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No matches yet</div>
            ) : (
              recentMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/dashboard/admin/matches/${match.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-white">
                      <span style={{ color: match.team1?.color }}>{match.team1?.short_name}</span>
                      <span className="text-gray-500 mx-2">vs</span>
                      <span style={{ color: match.team2?.color }}>{match.team2?.short_name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{match.total_overs} overs</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[match.status] || statusColors.scheduled}`}>
                    {match.status === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
                    {formatMatchStatus(match.status)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-arena-border flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              Recent Tournaments
            </h3>
            <Link href="/dashboard/admin/tournaments" className="text-xs text-pitch-400 hover:text-pitch-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-arena-border/50">
            {recentTournaments.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No tournaments yet</div>
            ) : (
              recentTournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/admin/tournaments/${t.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.format} • {new Date(t.start_date).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    t.status === 'active' ? 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20' :
                    t.status === 'upcoming' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                    'text-gray-400 bg-gray-500/10 border-gray-500/20'
                  }`}>
                    {t.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
