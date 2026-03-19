'use client'

import { motion } from 'framer-motion'
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react'

interface InningsBreakProps {
  innings1Score: { runs: number; wickets: number; overs: number; balls: number }
  target: number
  battingTeam: any
  onContinue: () => void
}

export function InningsBreakOverlay({ innings1Score, target, battingTeam, onContinue }: InningsBreakProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 16 }}
        className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-amber-500/30"
      >
        <div className="text-5xl mb-4">🏏</div>
        <h2 className="text-3xl font-display text-white mb-2">INNINGS BREAK</h2>
        <p className="text-gray-400 mb-6">End of 1st Innings</p>

        <div className="bg-arena-dark rounded-xl p-4 mb-6 space-y-3">
          <div className="text-2xl font-display text-white">
            {innings1Score.runs}/{innings1Score.wickets}
            <span className="text-base text-gray-500 ml-2 font-body">
              ({innings1Score.overs}.{innings1Score.balls} ov)
            </span>
          </div>
          <div className="h-px bg-arena-border" />
          <div>
            <div className="text-xs text-gray-500 mb-1">Target for</div>
            <div className="text-lg font-semibold" style={{ color: battingTeam?.color }}>
              {battingTeam?.name}
            </div>
            <div className="text-4xl font-display text-amber-400 mt-1">{target}</div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Start 2nd Innings
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </motion.div>
  )
}

interface MatchEndProps {
  result: { winner_team_id: string; win_by_runs?: number; win_by_wickets?: number; is_tie: boolean }
  teams: { team1: any; team2: any }
  shareToken: string
  onViewScorecard: () => void
}

export function MatchEndOverlay({ result, teams, shareToken, onViewScorecard }: MatchEndProps) {
  const winner = result.winner_team_id === teams.team1?.id ? teams.team1 : teams.team2

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 12, delay: 0.1 }}
        className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-pitch-500/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>

        {result.is_tie ? (
          <>
            <h2 className="text-3xl font-display text-white mb-2">MATCH TIED!</h2>
            <p className="text-gray-400 mb-6">An exciting tie!</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-display mb-2">
              <span style={{ color: winner?.color }}>{winner?.name}</span>
            </h2>
            <div className="text-xl font-display text-white mb-2">WON THE MATCH!</div>
            <p className="text-gray-400 mb-6">
              {result.win_by_runs
                ? `by ${result.win_by_runs} run${result.win_by_runs !== 1 ? 's' : ''}`
                : `by ${result.win_by_wickets} wicket${result.win_by_wickets !== 1 ? 's' : ''}`}
            </p>
          </>
        )}

        <div className="bg-arena-dark rounded-xl p-3 mb-6 text-center">
          <div className="text-xs text-gray-500 mb-1">Share this match</div>
          <div className="font-mono text-sm text-pitch-400">{shareToken}</div>
        </div>

        <button
          onClick={onViewScorecard}
          className="w-full py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Trophy size={18} />
          View Full Scorecard
        </button>
      </motion.div>
    </motion.div>
  )
}
