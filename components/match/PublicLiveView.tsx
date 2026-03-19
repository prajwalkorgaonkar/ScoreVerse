'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Radio, Share2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getBallColor, getBallLabel, calculateRunRate, calculateRequiredRunRate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  match: any
  currentInnings: any
  innings1: any
  innings2: any
  recentBalls: any[]
  token: string
}

export default function PublicLiveView({ match, currentInnings: initInnings, innings1: initI1, innings2: initI2, recentBalls: initBalls, token }: Props) {
  const supabase = createClient()
  const [innings, setInnings] = useState(initInnings)
  const [innings1, setInnings1] = useState(initI1)
  const [innings2, setInnings2] = useState(initI2)
  const [balls, setBalls] = useState(initBalls)
  const [matchStatus, setMatchStatus] = useState(match.status)
  const [lastBallFlash, setLastBallFlash] = useState<any>(null)

  const battingTeam = match.team1_id === innings?.batting_team_id ? match.team1 : match.team2
  const bowlingTeam = match.team1_id === innings?.bowling_team_id ? match.team1 : match.team2
  const team1 = match.team1
  const team2 = match.team2

  const crr = calculateRunRate(innings?.total_runs || 0, innings?.total_overs || 0, innings?.total_balls || 0)
  const rrr = innings?.target
    ? calculateRequiredRunRate(innings.target, innings.total_runs, match.total_overs, innings.total_overs, innings.total_balls)
    : null

  useEffect(() => {
    const channel = supabase.channel(`public-${token}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'balls', filter: `innings_id=eq.${innings?.id}` },
        (payload) => {
          setBalls((prev: any[]) => [payload.new, ...prev].slice(0, 36))
          setLastBallFlash(payload.new)
          setTimeout(() => setLastBallFlash(null), 2500)
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'innings', filter: `match_id=eq.${match.id}` },
        (payload) => {
          if (payload.new.innings_number === 1) setInnings1(payload.new)
          if (payload.new.innings_number === 2) setInnings2(payload.new)
          if (payload.new.innings_number === match.current_innings) setInnings(payload.new)
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${match.id}` },
        (payload) => setMatchStatus(payload.new.status)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [innings?.id, match.id, token])

  const currentOverBalls = balls.filter((b: any) => b.over_number === innings?.total_overs).slice(0, 6).reverse()

  const share = () => {
    navigator.share?.({
      title: `${team1?.short_name} vs ${team2?.short_name} - Live`,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    })
  }

  return (
    <div className="min-h-screen bg-arena-dark">
      {/* Header */}
      <div className="border-b border-arena-border/50 bg-arena-card/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-pitch-600 rounded flex items-center justify-center">
            <Trophy size={16} className="text-white" />
          </div>
          <span className="font-display text-white tracking-wider text-xl">CRICK<span className="text-pitch-500">ARENA</span></span>
        </div>
        <div className="flex items-center gap-3">
          {matchStatus === 'live' && (
            <div className="flex items-center gap-1.5">
              <span className="live-dot" />
              <span className="text-crimson-400 text-xs font-semibold">LIVE</span>
            </div>
          )}
          <button onClick={share} className="p-2 text-gray-400 hover:text-white transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Tournament badge */}
        {match.tournament && (
          <div className="text-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{match.tournament.name} · {match.tournament.format}</span>
          </div>
        )}

        {/* Main Scoreboard */}
        <motion.div
          className="glass-card rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-1 bg-gradient-to-r from-pitch-600 via-pitch-400 to-pitch-600" />
          <div className="p-6">
            {/* Match status */}
            {matchStatus === 'completed' && (
              <div className="mb-4 text-center">
                <div className="text-2xl font-display text-white">
                  {match.winner_team_id === match.team1_id ? team1?.name : team2?.name}
                  <span className="gradient-text ml-2">WON</span>
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {match.is_tie ? "Match tied!" :
                   match.win_by_runs ? `by ${match.win_by_runs} runs` :
                   match.win_by_wickets ? `by ${match.win_by_wickets} wickets` : ''}
                </div>
              </div>
            )}

            {/* Batting team score */}
            {innings && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium" style={{ color: battingTeam?.color }}>
                    {battingTeam?.name}
                    <span className="text-gray-500 ml-2 text-xs font-normal">batting</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {innings.total_overs}.{innings.total_balls} / {match.total_overs} ov
                  </div>
                </div>
                <motion.div
                  key={innings.total_runs}
                  className="text-6xl font-display text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {innings.total_runs}/{innings.total_wickets}
                </motion.div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-400">CRR: <span className="text-white font-medium">{crr.toFixed(2)}</span></span>
                  {rrr !== null && (
                    <span className={rrr > 12 ? 'text-crimson-400' : 'text-pitch-400'}>
                      RRR: <span className="font-medium">{rrr.toFixed(2)}</span>
                    </span>
                  )}
                  {innings.extras > 0 && (
                    <span className="text-gray-500">Extras: {innings.extras}</span>
                  )}
                </div>
                {innings.target && (
                  <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="text-amber-400 font-medium">
                      Target: {innings.target} · Need {innings.target - innings.total_runs} from{' '}
                      {(match.total_overs - innings.total_overs) * 6 - innings.total_balls} balls
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Previous innings */}
            {innings1 && match.current_innings === 2 && (
              <div className="mt-4 pt-4 border-t border-arena-border/50 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {match.team1_id === innings1.batting_team_id ? team1?.short_name : team2?.short_name}
                </span>
                <span className="text-white font-medium">
                  {innings1.total_runs}/{innings1.total_wickets} ({innings1.total_overs}.{innings1.total_balls} ov)
                </span>
              </div>
            )}

            {/* Current over balls */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Over {innings?.total_overs + 1}:</span>
              <div className="flex gap-1.5">
                {currentOverBalls.map((ball: any, i: number) => (
                  <motion.div
                    key={ball.id || i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getBallColor(ball)}`}
                  >
                    {getBallLabel(ball)}
                  </motion.div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 6 - currentOverBalls.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-8 h-8 rounded-full border border-dashed border-arena-border" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Both innings summary */}
        {innings1 && innings2 && (
          <div className="glass-card rounded-xl p-4 grid grid-cols-2 gap-4">
            {[
              { inns: innings1, team: match.team1_id === innings1.batting_team_id ? team1 : team2 },
              { inns: innings2, team: match.team1_id === innings2.batting_team_id ? team1 : team2 },
            ].map(({ inns, team }, i) => (
              <div key={i}>
                <div className="text-xs font-medium mb-1" style={{ color: team?.color }}>{team?.short_name}</div>
                <div className="text-2xl font-display text-white">{inns.total_runs}/{inns.total_wickets}</div>
                <div className="text-xs text-gray-500">{inns.total_overs}.{inns.total_balls} ov</div>
              </div>
            ))}
          </div>
        )}

        {/* Recent deliveries */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Deliveries</h3>
          <div className="flex flex-wrap gap-1.5">
            {balls.slice(0, 24).map((ball: any) => (
              <motion.div
                key={ball.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getBallColor(ball)}`}
                title={`${ball.batsman?.name || ''} off ${ball.bowler?.name || ''}`}
              >
                {getBallLabel(ball)}
              </motion.div>
            ))}
            {balls.length === 0 && (
              <span className="text-gray-600 text-sm">Waiting for first ball...</span>
            )}
          </div>
        </div>

        {matchStatus !== 'live' && matchStatus !== 'completed' && (
          <div className="text-center py-8 text-gray-500">
            <Radio size={32} className="mx-auto mb-3 text-gray-600" />
            <p>Match hasn't started yet</p>
            <p className="text-xs mt-1">This page will auto-update when the match begins</p>
          </div>
        )}
      </div>

      {/* Live ball flash */}
      <AnimatePresence>
        {lastBallFlash && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl font-display text-2xl shadow-2xl z-50 ${
              lastBallFlash.is_wicket ? 'bg-crimson-600 text-white' :
              lastBallFlash.runs === 6 ? 'bg-pitch-500 text-white' :
              lastBallFlash.runs === 4 ? 'bg-pitch-600 text-white' :
              'bg-arena-card border border-arena-border text-white'
            }`}
          >
            {lastBallFlash.is_wicket ? '🏏 WICKET!' :
             lastBallFlash.runs === 6 ? '🎯 SIX!' :
             lastBallFlash.runs === 4 ? '💥 FOUR!' :
             `${lastBallFlash.runs} RUN${lastBallFlash.runs !== 1 ? 'S' : ''}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-arena-border/50 py-6 mt-8">
        <p className="text-center text-gray-600 text-xs">
          Powered by <span className="text-pitch-400 font-medium">CrickArena</span> · All rights reserved to{' '}
          <span className="text-pitch-400">Prajwal Korgaonkar</span>
        </p>
      </footer>
    </div>
  )
}
