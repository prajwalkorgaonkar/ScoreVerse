'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy, Users, Swords, BarChart3, Plus, Edit2, Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatMatchStatus, calculateNRR } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  tournament: any
  teams: any[]
  matches: any[]
  role: string
}

export default function TournamentDetail({ tournament, teams: initTeams, matches, role }: Props) {
  const [teams, setTeams] = useState(initTeams)
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'matches' | 'points'>('overview')
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', short_name: '', color: '#22c55e' })
  const [addingTeam, setAddingTeam] = useState(false)

  const isAdmin = role === 'super_admin'
  const base = isAdmin ? '/dashboard/admin' : '/dashboard/manager'

  const addTeam = async () => {
    if (!newTeam.name || !newTeam.short_name) return toast.error('Name and short name required')
    setAddingTeam(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('teams').insert({
        ...newTeam,
        tournament_id: tournament.id,
        created_by: user?.id,
      }).select().single()
      if (error) throw error
      setTeams(prev => [...prev, data])
      setNewTeam({ name: '', short_name: '', color: '#22c55e' })
      setShowAddTeam(false)
      toast.success('Team added!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add team')
    } finally {
      setAddingTeam(false)
    }
  }

  // Calculate points table
  const pointsTable = teams.map(team => {
    const teamMatches = matches.filter(m =>
      m.status === 'completed' && (m.team1_id === team.id || m.team2_id === team.id)
    )
    const won = teamMatches.filter(m => m.winner_team_id === team.id).length
    const lost = teamMatches.filter(m => m.winner_team_id && m.winner_team_id !== team.id && !m.is_tie).length
    const tied = teamMatches.filter(m => m.is_tie).length
    const played = teamMatches.length
    const points = won * 2 + tied

    // NRR calculation
    let runsScored = 0, oversFaced = 0, runsConceded = 0, oversBowled = 0
    teamMatches.forEach(m => {
      const isTeam1 = m.team1_id === team.id
      const battingInnings = m.innings?.find((inn: any) =>
        inn.batting_team_id === team.id && inn.innings_number === (isTeam1 ? 1 : 2)
      )
      const bowlingInnings = m.innings?.find((inn: any) =>
        inn.bowling_team_id === team.id
      )
      if (battingInnings) {
        runsScored += battingInnings.total_runs
        oversFaced += battingInnings.total_overs + battingInnings.total_balls / 6
      }
      if (bowlingInnings) {
        runsConceded += bowlingInnings.total_runs
        oversBowled += bowlingInnings.total_overs + bowlingInnings.total_balls / 6
      }
    })

    const nrr = calculateNRR(runsScored, oversFaced, runsConceded, oversBowled)

    return { team, played, won, lost, tied, points, nrr }
  }).sort((a, b) => b.points - a.points || b.nrr - a.nrr)

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Trophy },
    { key: 'teams', label: `Teams (${teams.length})`, icon: Users },
    { key: 'matches', label: `Matches (${matches.length})`, icon: Swords },
    { key: 'points', label: 'Points Table', icon: BarChart3 },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-display text-white tracking-wide">{tournament.name}</h1>
            <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', {
              'text-pitch-400 bg-pitch-500/10 border-pitch-500/20': tournament.status === 'active',
              'text-blue-400 bg-blue-500/10 border-blue-500/20': tournament.status === 'upcoming',
              'text-gray-400 bg-gray-500/10 border-gray-500/20': tournament.status === 'completed',
            })}>
              {tournament.status}
            </span>
          </div>
          <p className="text-gray-500">{tournament.format} · {new Date(tournament.start_date).toLocaleDateString()}</p>
        </div>
        {isAdmin && (
          <Link
            href={`${base}/tournaments/${tournament.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-arena-border hover:border-gray-500 text-gray-400 hover:text-white text-sm rounded-xl transition-colors"
          >
            <Edit2 size={14} />
            Edit
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-arena-card rounded-xl border border-arena-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
              activeTab === tab.key ? 'bg-pitch-600 text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-4">
          {[
            { label: 'Teams', value: teams.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Matches', value: matches.length, icon: Swords, color: 'text-pitch-400', bg: 'bg-pitch-500/10' },
            { label: 'Completed', value: matches.filter(m => m.status === 'completed').length, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div className="text-3xl font-display text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Teams */}
      {activeTab === 'teams' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {teams.map(team => (
            <div key={team.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display text-lg text-white"
                  style={{ backgroundColor: team.color + '30', border: `2px solid ${team.color}` }}>
                  {team.short_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{team.name}</div>
                  <div className="text-xs text-gray-500">{team.short_name} · {team.players?.[0]?.count || 0} players</div>
                </div>
              </div>
              <Link
                href={`${base}/teams/${team.id}`}
                className="px-3 py-1.5 text-xs border border-arena-border hover:border-gray-500 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                Manage
              </Link>
            </div>
          ))}

          {isAdmin && (
            <>
              {showAddTeam ? (
                <div className="glass-card rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-white">Add New Team</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={newTeam.name} onChange={e => setNewTeam(f => ({ ...f, name: e.target.value }))}
                      className="input-arena text-sm" placeholder="Team Name" />
                    <input value={newTeam.short_name} onChange={e => setNewTeam(f => ({ ...f, short_name: e.target.value.toUpperCase().slice(0, 4) }))}
                      className="input-arena text-sm" placeholder="SHORT (4 chars)" maxLength={4} />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={newTeam.color} onChange={e => setNewTeam(f => ({ ...f, color: e.target.value }))}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-arena-border" />
                    <span className="text-sm text-gray-400">Team color</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddTeam(false)} className="btn-secondary flex-1 py-2 text-sm">
                      <X size={14} className="inline mr-1" />Cancel
                    </button>
                    <button onClick={addTeam} disabled={addingTeam} className="btn-primary flex-1 py-2 text-sm">
                      {addingTeam ? <Loader2 size={14} className="inline animate-spin mr-1" /> : <Check size={14} className="inline mr-1" />}
                      Add Team
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddTeam(true)}
                  className="w-full py-3 border-2 border-dashed border-arena-border hover:border-pitch-600 text-gray-500 hover:text-pitch-400 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add Team
                </button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Matches */}
      {activeTab === 'matches' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {matches.length === 0 ? (
            <div className="glass-card rounded-xl py-12 text-center text-gray-500">No matches in this tournament yet</div>
          ) : matches.map(match => (
            <Link key={match.id} href={`${base}/matches/${match.id}`}
              className="flex items-center justify-between glass-card rounded-xl p-4 hover:border-pitch-600/30 transition-colors">
              <div>
                <div className="font-medium text-white">
                  <span style={{ color: match.team1?.color }}>{match.team1?.short_name}</span>
                  <span className="text-gray-500 mx-2">vs</span>
                  <span style={{ color: match.team2?.color }}>{match.team2?.short_name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{match.total_overs} overs · {new Date(match.created_at).toLocaleDateString()}</div>
              </div>
              <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', {
                'text-crimson-400 bg-crimson-500/10 border-crimson-500/30': match.status === 'live',
                'text-pitch-400 bg-pitch-500/10 border-pitch-500/20': match.status === 'completed',
                'text-gray-400 bg-gray-500/10 border-gray-500/20': match.status === 'scheduled',
              })}>
                {formatMatchStatus(match.status)}
              </span>
            </Link>
          ))}
        </motion.div>
      )}

      {/* Points Table */}
      {activeTab === 'points' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-arena-border">
            <h3 className="font-semibold text-white">Points Table</h3>
          </div>
          {pointsTable.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No completed matches to calculate points</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="arena-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>L</th>
                    <th>T</th>
                    <th>Pts</th>
                    <th>NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {pointsTable.map((row, i) => (
                    <tr key={row.team.id} className={i === 0 ? 'bg-pitch-500/5' : ''}>
                      <td className="text-gray-500 font-medium">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.team.color }} />
                          <span className="text-white font-medium">{row.team.name}</span>
                          <span className="text-gray-600 text-xs">{row.team.short_name}</span>
                        </div>
                      </td>
                      <td className="text-center text-gray-300">{row.played}</td>
                      <td className="text-center text-pitch-400 font-medium">{row.won}</td>
                      <td className="text-center text-crimson-400">{row.lost}</td>
                      <td className="text-center text-amber-400">{row.tied}</td>
                      <td className="text-center font-bold text-white text-lg font-display">{row.points}</td>
                      <td className={cn('text-center font-mono text-sm', row.nrr >= 0 ? 'text-pitch-400' : 'text-crimson-400')}>
                        {row.nrr >= 0 ? '+' : ''}{row.nrr.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
