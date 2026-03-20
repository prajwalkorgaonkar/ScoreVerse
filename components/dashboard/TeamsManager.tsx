'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, ChevronDown, ChevronUp, Trash2, UserPlus, Loader2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  teams: any[]
  tournaments: any[]
  role: string
}

const PLAYER_ROLES = ['batsman', 'bowler', 'all_rounder', 'wicket_keeper']
const BATTING_STYLES = ['right_hand', 'left_hand']

export default function TeamsManager({ teams: initTeams, tournaments, role }: Props) {
  const [teams, setTeams] = useState(initTeams)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [addingPlayer, setAddingPlayer] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newTeam, setNewTeam] = useState({ name: '', short_name: '', color: '#22c55e', tournament_id: '' })
  const [newPlayer, setNewPlayer] = useState({ name: '', role: 'batsman', jersey_number: '', batting_style: 'right_hand', bowling_style: '' })
  const [savingTeam, setSavingTeam] = useState(false)
  const [savingPlayer, setSavingPlayer] = useState(false)

  const isAdmin = role === 'super_admin'

  const addTeam = async () => {
    if (!newTeam.name || !newTeam.short_name) return toast.error('Name and short name required')
    setSavingTeam(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('teams').insert({
        name: newTeam.name,
        short_name: newTeam.short_name.toUpperCase(),
        color: newTeam.color,
        tournament_id: newTeam.tournament_id || null,
        created_by: user?.id,
      }).select('*, players(*), tournament:tournaments(id, name)').single()
      if (error) throw error
      setTeams(prev => [data, ...prev])
      setNewTeam({ name: '', short_name: '', color: '#22c55e', tournament_id: '' })
      setShowAddTeam(false)
      toast.success('Team created!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create team')
    } finally {
      setSavingTeam(false)
    }
  }

  const addPlayer = async (teamId: string) => {
    if (!newPlayer.name) return toast.error('Player name required')
    setSavingPlayer(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('players').insert({
        name: newPlayer.name,
        role: newPlayer.role,
        team_id: teamId,
        jersey_number: newPlayer.jersey_number ? parseInt(newPlayer.jersey_number) : null,
        batting_style: newPlayer.batting_style,
        bowling_style: newPlayer.bowling_style || null,
      }).select().single()
      if (error) throw error

      setTeams(prev => prev.map(t =>
        t.id === teamId ? { ...t, players: [...(t.players || []), data] } : t
      ))
      setNewPlayer({ name: '', role: 'batsman', jersey_number: '', batting_style: 'right_hand', bowling_style: '' })
      setAddingPlayer(null)
      toast.success('Player added!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add player')
    } finally {
      setSavingPlayer(false)
    }
  }

  const deletePlayer = async (playerId: string, teamId: string) => {
    if (!confirm('Delete this player?')) return
    setDeletingId(playerId)
    try {
      const supabase = createClient()
      await supabase.from('players').delete().eq('id', playerId)
      setTeams(prev => prev.map(t =>
        t.id === teamId ? { ...t, players: t.players.filter((p: any) => p.id !== playerId) } : t
      ))
      toast.success('Player removed')
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    } finally {
      setDeletingId(null)
    }
  }

  const deleteTeam = async (teamId: string) => {
    if (!confirm('Delete this team and all its players?')) return
    setDeletingId(teamId)
    try {
      const supabase = createClient()
      await supabase.from('teams').delete().eq('id', teamId)
      setTeams(prev => prev.filter(t => t.id !== teamId))
      toast.success('Team deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    } finally {
      setDeletingId(null)
    }
  }

  const roleColor: Record<string, string> = {
    batsman: 'text-pitch-400',
    bowler: 'text-blue-400',
    all_rounder: 'text-amber-400',
    wicket_keeper: 'text-purple-400',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white tracking-wide">TEAMS & <span className="gradient-text">PLAYERS</span></h1>
          <p className="text-gray-500 mt-1">{teams.length} teams · {teams.reduce((s, t) => s + (t.players?.length || 0), 0)} players</p>
        </div>
        <button
          onClick={() => setShowAddTeam(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Team
        </button>
      </div>

      {/* Add Team Form */}
      <AnimatePresence>
        {showAddTeam && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-xl p-5 border border-blue-600/30 space-y-4"
          >
            <h3 className="font-semibold text-white">Create New Team</h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={newTeam.name} onChange={e => setNewTeam(f => ({ ...f, name: e.target.value }))}
                className="input-arena text-sm" placeholder="Team Name" />
              <input value={newTeam.short_name} onChange={e => setNewTeam(f => ({ ...f, short_name: e.target.value.toUpperCase().slice(0, 4) }))}
                className="input-arena text-sm" placeholder="SHORT" maxLength={4} />
              <select value={newTeam.tournament_id} onChange={e => setNewTeam(f => ({ ...f, tournament_id: e.target.value }))}
                className="input-arena text-sm col-span-2">
                <option value="">No Tournament</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={newTeam.color} onChange={e => setNewTeam(f => ({ ...f, color: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-arena-border" />
              <span className="text-sm text-gray-400">Team color: {newTeam.color}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddTeam(false)} className="btn-secondary flex-1 py-2 text-sm">
                <X size={14} className="inline mr-1" /> Cancel
              </button>
              <button onClick={addTeam} disabled={savingTeam} className="btn-primary flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-500">
                {savingTeam ? <Loader2 size={14} className="inline animate-spin mr-1" /> : <Check size={14} className="inline mr-1" />}
                Create Team
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teams list */}
      {teams.length === 0 ? (
        <div className="glass-card rounded-2xl py-16 text-center">
          <Users size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No teams yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map(team => (
            <motion.div key={team.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
              {/* Team header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display text-white text-lg"
                    style={{ backgroundColor: team.color + '25', border: `2px solid ${team.color}` }}
                  >
                    {team.short_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{team.name}</div>
                    <div className="text-xs text-gray-500">
                      {team.short_name}
                      {team.tournament && <span className="ml-2">· {team.tournament.name}</span>}
                      <span className="ml-2">· {team.players?.length || 0} players</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); deleteTeam(team.id) }}
                    disabled={deletingId === team.id}
                    className="p-1.5 text-gray-600 hover:text-crimson-400 hover:bg-crimson-500/10 rounded-lg transition-colors"
                  >
                    {deletingId === team.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                  {expandedTeam === team.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {/* Players */}
              <AnimatePresence>
                {expandedTeam === team.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-arena-border overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {(team.players || []).length === 0 ? (
                        <p className="text-gray-600 text-sm text-center py-3">No players yet</p>
                      ) : (
                        <div className="grid gap-2">
                          {team.players.map((player: any) => (
                            <div key={player.id} className="flex items-center justify-between px-3 py-2 bg-arena-dark rounded-lg">
                              <div className="flex items-center gap-3">
                                {player.jersey_number && (
                                  <span className="text-xs text-gray-600 w-6 text-center font-mono">#{player.jersey_number}</span>
                                )}
                                <div>
                                  <span className="text-sm text-white font-medium">{player.name}</span>
                                  <span className={cn('text-xs ml-2 capitalize', roleColor[player.role])}>{player.role.replace('_', ' ')}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => deletePlayer(player.id, team.id)}
                                disabled={deletingId === player.id}
                                className="p-1 text-gray-600 hover:text-crimson-400 rounded transition-colors"
                              >
                                {deletingId === player.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add player form */}
                      {addingPlayer === team.id ? (
                        <div className="mt-3 p-3 bg-arena-dark rounded-xl border border-arena-border space-y-3">
                          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Add Player</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <input value={newPlayer.name} onChange={e => setNewPlayer(f => ({ ...f, name: e.target.value }))}
                              className="input-arena text-sm col-span-2" placeholder="Player Name" />
                            <div className="col-span-2 space-y-2">
                              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Player Role</label>
                              <div className="flex flex-wrap gap-1.5">
                                {PLAYER_ROLES.map(r => (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() => setNewPlayer(f => ({ ...f, role: r }))}
                                    className={cn(
                                      'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border',
                                      newPlayer.role === r 
                                        ? 'bg-pitch-600 border-pitch-500 text-white shadow-glow-green/20' 
                                        : 'bg-arena-card border-arena-border text-gray-400 hover:border-gray-500'
                                    )}
                                  >
                                    {r.replace('_', ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="col-span-2 space-y-2">
                              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Batting Style</label>
                              <div className="flex gap-1.5">
                                {BATTING_STYLES.map(s => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setNewPlayer(f => ({ ...f, batting_style: s }))}
                                    className={cn(
                                      'flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border text-center',
                                      newPlayer.batting_style === s 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-glow-blue/20' 
                                        : 'bg-arena-card border-arena-border text-gray-400 hover:border-gray-500'
                                    )}
                                  >
                                    {s.replace('_hand', '')} Hand
                                  </button>
                                ))}
                              </div>
                            </div>

                            <input value={newPlayer.jersey_number} onChange={e => setNewPlayer(f => ({ ...f, jersey_number: e.target.value }))}
                              className="input-arena text-sm" placeholder="Jersey # (opt)" type="number" min={1} />
                            
                            <input value={newPlayer.bowling_style} onChange={e => setNewPlayer(f => ({ ...f, bowling_style: e.target.value }))}
                              className="input-arena text-sm" placeholder="Bowling style (opt)" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setAddingPlayer(null)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                            <button onClick={() => addPlayer(team.id)} disabled={savingPlayer} className="btn-primary flex-1 py-2 text-sm">
                              {savingPlayer ? <Loader2 size={12} className="inline animate-spin mr-1" /> : null}
                              Add Player
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingPlayer(team.id)}
                          className="w-full mt-2 py-2 border border-dashed border-arena-border hover:border-pitch-600 text-gray-600 hover:text-pitch-400 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <UserPlus size={14} />
                          Add Player
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
