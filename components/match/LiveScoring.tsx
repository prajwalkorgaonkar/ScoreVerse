'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RotateCcw, Share2, Loader2 } from 'lucide-react'
import { useLiveMatch } from '@/hooks/useLiveMatch'
import { InningsBreakOverlay, MatchEndOverlay } from './MatchStateOverlays'
import { cn, getBallColor, getBallLabel, calculateRunRate, calculateRequiredRunRate } from '@/lib/utils'
import toast from 'react-hot-toast'



interface Props {
  match: any
  currentInnings: any
  matchPlayers: any[]
  recentBalls: any[]
  userId: string
  role: string
}

const EXTRA_TYPES = ['wide', 'no_ball', 'bye', 'leg_bye']
const WICKET_TYPES = ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket']

export default function LiveScoring({ match, currentInnings: initInnings, matchPlayers, recentBalls: initBalls, role }: Props) {
  const router = useRouter()
  const base = role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'

  const {
    innings, balls, lastBall, submitting, undoing,
    nextState, matchResult, newInnings,
    currentOverBalls, recordBall, undoLastBall, switchToInnings2,
  } = useLiveMatch({ match, initialInnings: initInnings, initialBalls: initBalls })

  // Form state
  const [runs, setRuns]                     = useState(0)
  const [extras, setExtras]                 = useState(0)
  const [extraType, setExtraType]           = useState<string | null>(null)
  const [isWicket, setIsWicket]             = useState(false)
  const [wicketType, setWicketType]         = useState('bowled')
  const [currentBatsmanId, setBatsman]      = useState('')
  const [currentBowlerId, setBowler]        = useState('')
  const [fielderIdForWicket, setFielder]    = useState('')

  const battingPlayers = matchPlayers.filter(mp => mp.team_id === innings?.batting_team_id)
  const bowlingPlayers = matchPlayers.filter(mp => mp.team_id === innings?.bowling_team_id)
  const battingTeam    = match.team1_id === innings?.batting_team_id ? match.team1 : match.team2
  const innings1       = match.innings?.find((i: any) => i.innings_number === 1)

  const crr = calculateRunRate(innings?.total_runs || 0, innings?.total_overs || 0, innings?.total_balls || 0)
  const rrr = innings?.target
    ? calculateRequiredRunRate(innings.target, innings.total_runs, match.total_overs, innings.total_overs, innings.total_balls)
    : null

  const resetForm = () => {
    setRuns(0); setExtras(0); setExtraType(null)
    setIsWicket(false); setWicketType('bowled'); setFielder('')
  }

  const handleSubmit = async () => {
    if (!currentBatsmanId || !currentBowlerId) return toast.error('Select batsman and bowler')
    const result = await recordBall({
      batsman_id: currentBatsmanId,
      bowler_id: currentBowlerId,
      runs, extras,
      extra_type: extraType,
      is_wicket: isWicket,
      wicket_type: isWicket ? wicketType : null,
      fielder_id: fielderIdForWicket || null,
    })
    if (result) resetForm()
  }

  const handleInnings2Continue = () => {
    switchToInnings2()
  }

  const handleViewScorecard = () => {
    router.push(`${base}/matches/${match.id}/scorecard`)
  }

  return (
    <div className="max-w-4xl space-y-4">
      {/* Innings break overlay */}
      {nextState === 'innings_break' && newInnings && innings1 && (
        <InningsBreakOverlay
          innings1Score={{ runs: innings1.total_runs, wickets: innings1.total_wickets, overs: innings1.total_overs, balls: innings1.total_balls }}
          target={newInnings.target}
          battingTeam={match.team1_id === newInnings.batting_team_id ? match.team1 : match.team2}
          onContinue={handleInnings2Continue}
        />
      )}

      {/* Match end overlay */}
      {nextState === 'match_end' && matchResult && (
        <MatchEndOverlay
          result={matchResult}
          teams={{ team1: match.team1, team2: match.team2 }}
          shareToken={match.share_token}
          onViewScorecard={handleViewScorecard}
        />
      )}

      {/* Scoreboard */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-pitch-600 via-pitch-400 to-pitch-600" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-crimson-400 text-sm font-semibold">LIVE</span>
              <span className="text-gray-500 text-xs">• Over {innings?.total_overs}.{innings?.total_balls}</span>
              <span className="text-gray-600 text-xs">• Innings {innings?.innings_number}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={undoLastBall}
                disabled={undoing || balls.length === 0}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-400 transition-colors disabled:opacity-30"
                title="Undo last ball"
              >
                {undoing ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                Undo
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/match/live/${match.share_token}`); toast.success('Copied!') }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <Share2 size={12} /> Share
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: battingTeam?.color }}>
                {battingTeam?.name} <span className="text-gray-500 text-xs">(Batting)</span>
              </div>
              <motion.div key={innings?.total_runs} className="text-5xl font-display text-white"
                animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.25 }}>
                {innings?.total_runs}/{innings?.total_wickets}
              </motion.div>
              <div className="text-gray-400 text-sm mt-1">
                CRR: <span className="text-white font-medium">{crr.toFixed(2)}</span>
                {rrr !== null && (
                  <> | RRR: <span className={rrr > 12 ? 'text-crimson-400' : 'text-pitch-400'}>{rrr.toFixed(2)}</span></>
                )}
              </div>
              {innings?.extras > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  Extras: {innings.extras} (wd {innings.wide_count||0}, nb {innings.no_ball_count||0}, b {innings.bye_count||0}, lb {innings.leg_bye_count||0})
                </div>
              )}
            </div>
            {innings?.target && (
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Target</div>
                <div className="text-3xl font-display text-amber-400">{innings.target}</div>
                <div className="text-xs text-amber-400 mt-1">
                  Need {Math.max(0, innings.target - innings.total_runs)} from{' '}
                  {Math.max(0, (match.total_overs - innings.total_overs) * 6 - innings.total_balls)} balls
                </div>
              </div>
            )}
          </div>

          {/* Current over balls */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">Over {innings?.total_overs + 1}:</span>
            <div className="flex gap-1.5">
              {currentOverBalls.map((ball: any) => (
                <motion.div key={ball.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getBallColor(ball)}`}>
                  {getBallLabel(ball)}
                </motion.div>
              ))}
              {Array.from({ length: Math.max(0, 6 - currentOverBalls.length) }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border border-dashed border-arena-border/50" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Runs & Extras */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Runs Scored</h3>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map(r => (
              <button key={r} onClick={() => setRuns(r)}
                className={cn('py-3 rounded-xl font-display text-xl font-bold transition-all',
                  runs === r
                    ? r === 6 ? 'bg-pitch-500 text-white shadow-glow-green' : r === 4 ? 'bg-pitch-600 text-white' : 'bg-pitch-600/60 text-white border border-pitch-500'
                    : 'bg-arena-dark border border-arena-border text-gray-300 hover:border-gray-500'
                )}>
                {r}
              </button>
            ))}
            <input type="number" value={runs > 6 ? runs : ''} onChange={e => setRuns(parseInt(e.target.value) || 0)}
              placeholder="?" min={0}
              className="py-3 rounded-xl font-display text-xl text-center bg-arena-dark border border-arena-border text-gray-300 focus:outline-none focus:border-pitch-500" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Extras</h3>
            <div className="grid grid-cols-4 gap-2">
              {EXTRA_TYPES.map(et => (
                <button key={et} onClick={() => setExtraType(extraType === et ? null : et)}
                  className={cn('py-2 rounded-lg text-xs font-medium uppercase transition-all',
                    extraType === et ? 'bg-amber-500 text-black font-bold' : 'bg-arena-dark border border-arena-border text-gray-400 hover:border-gray-500'
                  )}>
                  {et === 'no_ball' ? 'NB' : et === 'leg_bye' ? 'LB' : et.slice(0, 2).toUpperCase()}
                </button>
              ))}
            </div>
            {extraType && (
              <div className="mt-2">
                <label className="text-xs text-gray-500 mb-1 block">Extra runs</label>
                <input type="number" value={extras} onChange={e => setExtras(parseInt(e.target.value) || 0)}
                  className="input-arena text-sm" min={0} max={10} />
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setIsWicket(!isWicket)}
              className={cn('w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all',
                isWicket ? 'bg-crimson-600 text-white shadow-glow-red' : 'bg-arena-dark border border-arena-border text-gray-400 hover:border-crimson-500/50 hover:text-crimson-400'
              )}>
              {isWicket ? '🏏 WICKET!' : 'Mark as Wicket'}
            </button>
            {isWicket && (
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {WICKET_TYPES.map(wt => (
                  <button key={wt} onClick={() => setWicketType(wt)}
                    className={cn('py-2 rounded-lg text-xs font-medium capitalize transition-all',
                      wicketType === wt ? 'bg-crimson-600 text-white' : 'bg-arena-dark border border-arena-border text-gray-400 hover:border-crimson-500/50'
                    )}>
                    {wt.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Players & Submit */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Batsman on Strike <span className="text-crimson-400">*</span></label>
            <select value={currentBatsmanId} onChange={e => setBatsman(e.target.value)} className="input-arena text-sm">
              <option value="">Select batsman…</option>
              {battingPlayers.map(mp => <option key={mp.player_id} value={mp.player_id}>{mp.player?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Bowler <span className="text-crimson-400">*</span></label>
            <select value={currentBowlerId} onChange={e => setBowler(e.target.value)} className="input-arena text-sm">
              <option value="">Select bowler…</option>
              {bowlingPlayers.map(mp => <option key={mp.player_id} value={mp.player_id}>{mp.player?.name}</option>)}
            </select>
          </div>

          {isWicket && ['caught','run_out','stumped'].includes(wicketType) && (
            <div>
              <label className="text-sm text-gray-400 block mb-2">Fielder {wicketType === 'stumped' ? '(Keeper)' : ''}</label>
              <select value={fielderIdForWicket} onChange={e => setFielder(e.target.value)} className="input-arena text-sm">
                <option value="">Select fielder…</option>
                {bowlingPlayers.map(mp => <option key={mp.player_id} value={mp.player_id}>{mp.player?.name}</option>)}
              </select>
            </div>
          )}

          {/* Preview */}
          <div className="bg-arena-dark rounded-xl p-3 border border-arena-border flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isWicket ? 'bg-crimson-500 text-white' : extraType ? 'bg-amber-500 text-black' :
              runs === 6 ? 'bg-pitch-500 text-white' : runs === 4 ? 'bg-pitch-600 text-white' : 'bg-arena-muted text-white'
            }`}>
              {isWicket ? 'W' : extraType ? `${extraType.slice(0,1).toUpperCase()}+${runs||extras}` : runs}
            </div>
            <div className="text-sm text-gray-400">
              {isWicket ? `Wicket — ${wicketType.replace('_',' ')}` :
               extraType ? `${extraType.replace('_',' ')} + ${runs} run${runs!==1?'s':''}` :
               `${runs} run${runs!==1?'s':''}`}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting || !currentBatsmanId || !currentBowlerId}
            className={cn('w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
              !submitting && currentBatsmanId && currentBowlerId
                ? isWicket ? 'bg-crimson-600 hover:bg-crimson-500 text-white shadow-glow-red' : 'bg-pitch-600 hover:bg-pitch-500 text-white shadow-glow-green'
                : 'bg-arena-card border border-arena-border text-gray-500 cursor-not-allowed'
            )}>
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {submitting ? 'Recording…' : 'Record Ball'}
          </button>
        </div>
      </div>

      {/* Ball History */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Ball History</h3>
          <span className="text-xs text-gray-600">{balls.length} deliveries</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {balls.slice(0, 36).map((ball: any) => (
            <div key={ball.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getBallColor(ball)}`}
              title={`Ov ${ball.over_number+1}.${ball.ball_number+1}`}>
              {getBallLabel(ball)}
            </div>
          ))}
          {balls.length === 0 && <span className="text-gray-600 text-sm">No balls recorded yet</span>}
        </div>
      </div>

      {/* Toast flash */}
      <AnimatePresence>
        {lastBall && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn('fixed bottom-6 right-6 px-6 py-3 rounded-xl font-display text-lg shadow-2xl z-50',
              lastBall.is_wicket ? 'bg-crimson-600 text-white' :
              lastBall.runs === 6 ? 'bg-pitch-500 text-white' :
              lastBall.runs === 4 ? 'bg-pitch-600 text-white' :
              'bg-arena-card border border-arena-border text-white'
            )}>
            {lastBall.is_wicket ? '🏏 WICKET!' :
             lastBall.runs === 6 ? '🎯 SIX!' :
             lastBall.runs === 4 ? '💥 FOUR!' :
             `${lastBall.runs} RUN${lastBall.runs!==1?'S':''}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
