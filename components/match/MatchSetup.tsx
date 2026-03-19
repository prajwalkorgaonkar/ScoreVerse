'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Play, Share2, Check, Loader2, Copy, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import CoinToss from './CoinToss'

interface Props {
  match: any
  team1Players: any[]
  team2Players: any[]
  matchPlayers: any[]
  userId: string
  role: string
}

export default function MatchSetup({ match, team1Players, team2Players, matchPlayers, userId, role }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'toss'>('overview')
  const [selectedTeam1, setSelectedTeam1] = useState<string[]>(
    matchPlayers.filter(mp => mp.team_id === match.team1_id).map(mp => mp.player_id)
  )
  const [selectedTeam2, setSelectedTeam2] = useState<string[]>(
    matchPlayers.filter(mp => mp.team_id === match.team2_id).map(mp => mp.player_id)
  )
  const [tossCompleted, setTossCompleted] = useState(!!match.toss_winner_id)
  const [savingPlayers, setSavingPlayers] = useState(false)
  const [starting, setStarting] = useState(false)

  const base = role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'
  const liveUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/match/live/${match.share_token}`

  const togglePlayer = (playerId: string, teamId: string) => {
    if (teamId === match.team1_id) {
      setSelectedTeam1(prev =>
        prev.includes(playerId)
          ? prev.filter(id => id !== playerId)
          : prev.length < match.players_per_team
            ? [...prev, playerId]
            : prev
      )
    } else {
      setSelectedTeam2(prev =>
        prev.includes(playerId)
          ? prev.filter(id => id !== playerId)
          : prev.length < match.players_per_team
            ? [...prev, playerId]
            : prev
      )
    }
  }

  const savePlayers = async () => {
    if (selectedTeam1.length !== match.players_per_team || selectedTeam2.length !== match.players_per_team) {
      return toast.error(`Select exactly ${match.players_per_team} players per team`)
    }
    setSavingPlayers(true)
    try {
      const supabase = createClient()
      // Delete existing
      await supabase.from('match_players').delete().eq('match_id', match.id)
      // Insert new
      const entries = [
        ...selectedTeam1.map((pid, i) => ({ match_id: match.id, player_id: pid, team_id: match.team1_id, batting_order: i + 1 })),
        ...selectedTeam2.map((pid, i) => ({ match_id: match.id, player_id: pid, team_id: match.team2_id, batting_order: i + 1 })),
      ]
      const { error } = await supabase.from('match_players').insert(entries)
      if (error) throw error
      toast.success('Playing XI saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save players')
    } finally {
      setSavingPlayers(false)
    }
  }

  const startMatch = async () => {
    if (!match.toss_winner_id) return toast.error('Complete the toss first')
    if (selectedTeam1.length !== match.players_per_team || selectedTeam2.length !== match.players_per_team) {
      return toast.error(`Select ${match.players_per_team} players per team`)
    }

    setStarting(true)
    try {
      const supabase = createClient()
      const battingTeamId = match.toss_choice === 'bat' ? match.toss_winner_id :
        match.toss_winner_id === match.team1_id ? match.team2_id : match.team1_id
      const bowlingTeamId = battingTeamId === match.team1_id ? match.team2_id : match.team1_id

      await supabase.from('matches').update({
        status: 'live',
        batting_team_id: battingTeamId,
        bowling_team_id: bowlingTeamId,
      }).eq('id', match.id)

      // Create innings 1
      await supabase.from('innings').insert({
        match_id: match.id,
        batting_team_id: battingTeamId,
        bowling_team_id: bowlingTeamId,
        innings_number: 1,
        target: null,
      })

      toast.success('Match started! 🏏')
      router.push(`${base}/matches/${match.id}/scoring`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to start match')
    } finally {
      setStarting(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(liveUrl)
    toast.success('Live link copied!')
  }

  const isReady = match.toss_winner_id &&
    selectedTeam1.length === match.players_per_team &&
    selectedTeam2.length === match.players_per_team

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-white tracking-wide">MATCH <span className="gradient-text">SETUP</span></h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-display text-lg" style={{ color: match.team1?.color }}>
            {match.team1?.short_name}
          </span>
          <span className="text-gray-600">VS</span>
          <span className="font-display text-lg" style={{ color: match.team2?.color }}>
            {match.team2?.short_name}
          </span>
          <span className="text-gray-500 text-sm">• {match.total_overs} overs • {match.players_per_team} players</span>
        </div>
      </div>

      {/* Share link */}
      <div className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Share2 size={18} className="text-pitch-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Live Share Link</div>
            <div className="text-sm text-white font-mono truncate">{liveUrl}</div>
          </div>
        </div>
        <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 bg-pitch-600/20 hover:bg-pitch-600/40 text-pitch-400 text-sm rounded-lg transition-colors flex-shrink-0">
          <Copy size={14} />
          Copy
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-arena-card rounded-xl border border-arena-border">
        {(['overview', 'players', 'toss'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium rounded-lg capitalize transition-all',
              activeTab === tab
                ? 'bg-pitch-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {tab === 'players' ? `Playing XI` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {[
              { label: 'Toss', done: !!match.toss_winner_id, detail: match.toss_winner_id
                ? `${match.toss_winner_id === match.team1_id ? match.team1?.name : match.team2?.name} won — chose to ${match.toss_choice}`
                : 'Not done', tab: 'toss' as const },
              { label: 'Playing XI', done: selectedTeam1.length === match.players_per_team && selectedTeam2.length === match.players_per_team,
                detail: `${match.team1?.short_name}: ${selectedTeam1.length}/${match.players_per_team} | ${match.team2?.short_name}: ${selectedTeam2.length}/${match.players_per_team}`, tab: 'players' as const },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className="w-full glass-card rounded-xl p-5 text-left hover:border-pitch-600/30 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    item.done ? 'bg-pitch-600/20' : 'bg-arena-muted'
                  )}>
                    {item.done ? <Check size={16} className="text-pitch-400" /> : <span className="text-gray-500 text-sm">?</span>}
                  </div>
                  <div>
                    <div className="font-medium text-white">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.detail}</div>
                  </div>
                </div>
                <ChevronDown size={16} className="text-gray-500 -rotate-90" />
              </button>
            ))}

            <button
              onClick={startMatch}
              disabled={!isReady || starting}
              className={cn(
                'w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all',
                isReady && !starting
                  ? 'bg-pitch-600 hover:bg-pitch-500 text-white shadow-glow-green'
                  : 'bg-arena-card border border-arena-border text-gray-500 cursor-not-allowed'
              )}
            >
              {starting ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
              {starting ? 'Starting...' : isReady ? 'Start Match' : 'Complete setup to start'}
            </button>
          </motion.div>
        )}

        {/* Players tab */}
        {activeTab === 'players' && (
          <motion.div key="players" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {[
              { team: match.team1, players: team1Players, selected: selectedTeam1 },
              { team: match.team2, players: team2Players, selected: selectedTeam2 },
            ].map(({ team, players, selected }) => (
              <div key={team.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                    {team.name}
                  </h3>
                  <span className={cn(
                    'text-sm font-medium',
                    selected.length === match.players_per_team ? 'text-pitch-400' : 'text-gray-400'
                  )}>
                    {selected.length}/{match.players_per_team}
                  </span>
                </div>
                {players.length === 0 ? (
                  <div className="p-4 glass-card rounded-xl text-center text-gray-500 text-sm">
                    No players found. Add players to this team first.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {players.map((player: any) => {
                      const isSelected = selected.includes(player.id)
                      const isMaxed = selected.length >= match.players_per_team && !isSelected
                      return (
                        <button
                          key={player.id}
                          onClick={() => togglePlayer(player.id, team.id)}
                          disabled={isMaxed}
                          className={cn(
                            'p-3 rounded-xl border text-left transition-all flex items-center gap-2',
                            isSelected ? 'border-pitch-500 bg-pitch-500/10' :
                            isMaxed ? 'border-arena-border opacity-40 cursor-not-allowed' :
                            'border-arena-border hover:border-gray-600'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border',
                            isSelected ? 'bg-pitch-600 border-pitch-600' : 'border-gray-600'
                          )}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">{player.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{player.role.replace('_', ' ')}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={savePlayers}
              disabled={savingPlayers}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {savingPlayers ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {savingPlayers ? 'Saving...' : 'Save Playing XI'}
            </button>
          </motion.div>
        )}

        {/* Toss tab */}
        {activeTab === 'toss' && (
          <motion.div key="toss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CoinToss match={match} onComplete={() => { setTossCompleted(true); setActiveTab('overview') }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
