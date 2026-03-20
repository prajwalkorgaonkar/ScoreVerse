'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RotateCcw, Share2, Loader2 } from 'lucide-react'
import { useLiveMatch } from '@/hooks/useLiveMatch'
import { InningsBreakOverlay, MatchEndOverlay } from './MatchStateOverlays'
import { ShareMenu } from './ShareMenu'
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

  const dismissedIds = new Set(balls.filter(b => b.is_wicket && b.wicket_type !== 'retired_hurt').map(b => b.batsman_id))
  const battingPlayers = matchPlayers.filter(mp => mp.team_id === innings?.batting_team_id && !dismissedIds.has(mp.player_id))
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
    
    // Fielder validation
    if (isWicket && ['caught', 'stumped', 'run_out'].includes(wicketType) && !fielderIdForWicket) {
      return toast.error(`Please select a fielder for ${wicketType.replace('_', ' ')}`)
    }

    const result = await recordBall({
      batsman_id: currentBatsmanId,
      bowler_id: currentBowlerId,
      runs, extras,
      extra_type: extraType,
      is_wicket: isWicket,
      wicket_type: isWicket ? wicketType : null,
      fielder_id: fielderIdForWicket || null,
    })

    if (result && typeof result === 'object' && 'over_completed' in result) {
      resetForm()
      // If wicket, clear batsman so a new one must be selected
      if (isWicket) setBatsman('')
      // If over complete, clear bowler
      if (result.over_completed) setBowler('')
    }
  }

  const handleInnings2Continue = () => {
    switchToInnings2()
  }

  const handleViewScorecard = () => {
    router.push(`${base}/matches/${match.id}/scorecard`)
  }


  // Calculate over summaries for history
  const getOverSummaries = () => {
    const overs: Record<number, { runs: number; wickets: number; balls: any[] }> = {}
    balls.forEach(ball => {
      const ov = ball.over_number
      if (!overs[ov]) overs[ov] = { runs: 0, wickets: 0, balls: [] }
      overs[ov].runs += (ball.runs || 0) + (ball.extras || 0)
      if (ball.is_wicket) overs[ov].wickets++
      overs[ov].balls.push(ball)
    })
    return Object.entries(overs)
      .map(([num, data]) => ({ number: parseInt(num), ...data }))
      .sort((a, b) => b.number - a.number) // Latest over first
  }

  const overSummaries = getOverSummaries()

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

      {/* Sticky Mobile Header */}
      <div className="sticky top-0 left-0 right-0 z-20 lg:hidden -mx-4 px-4 py-2 bg-arena-card/90 backdrop-blur-lg border-b border-arena-border shadow-lg transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-pitch-400 uppercase tracking-widest">{battingTeam?.short_name}</span>
            <div className="text-xl font-display text-white">
              {innings?.total_runs}/{innings?.total_wickets}
              <span className="text-[10px] text-gray-500 ml-2 font-mono">({innings?.total_overs}.{innings?.total_balls})</span>
            </div>
          </div>
          {innings?.target && (
            <div className="text-right">
              <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest block">Need</span>
              <span className="text-lg font-display text-amber-400">{Math.max(0, innings.target - innings.total_runs)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Scoreboard */}
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
              <ShareMenu match={match} />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: battingTeam?.color }}>
                {battingTeam?.name} {match.status !== 'completed' && <span className="text-gray-500 text-xs">(Batting)</span>}
              </div>
              <motion.div key={innings?.total_runs} className="text-5xl font-display text-white"
                animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.25 }}>
                {innings?.total_runs}/{innings?.total_wickets}
              </motion.div>
              <div className="text-gray-400 text-sm mt-1 flex items-center gap-3">
                <span>CRR: <span className="text-white font-medium">{crr.toFixed(2)}</span></span>
                {rrr !== null && (
                  <>
                   <div className="w-px h-3 bg-arena-border" />
                   <span>RRR: <span className={rrr > 12 ? 'text-crimson-400' : 'text-pitch-400'}>{rrr.toFixed(2)}</span></span>
                  </>
                )}
              </div>
              {innings?.extras > 0 && (
                <div className="text-[10px] text-gray-600 mt-2 bg-arena-dark/30 px-2 py-1 rounded w-fit border border-arena-border/50">
                  Extras: {innings.extras} (wd {innings.wide_count||0}, nb {innings.no_ball_count||0}, b {innings.bye_count||0}, lb {innings.leg_bye_count||0})
                </div>
              )}
            </div>
            {matchResult || match.status === 'completed' ? (
              <div className="text-right">
                 <div className="text-[10px] text-pitch-500 mb-1 font-bold uppercase tracking-widest">Match Result</div>
                 <div className="text-2xl font-display text-pitch-400">
                    {(matchResult || match).is_tie ? 'Tied' :
                     `${(matchResult || match).winner_team_id === match.team1_id ? match.team1.short_name : match.team2.short_name} Won`}
                 </div>
                 <div className="text-[10px] text-pitch-400 mt-1 font-bold uppercase tracking-tighter opacity-80">
                    {(matchResult || match).win_by_runs ? `by ${(matchResult || match).win_by_runs} runs` : `by ${(matchResult || match).win_by_wickets} wickets`}
                 </div>
              </div>
            ) : innings?.target ? (
              <div className="text-right bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10">
                <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-widest">Target Score</div>
                <div className="text-3xl font-display text-amber-400">{innings.target}</div>
                <div className="text-[10px] text-amber-500 mt-1 font-bold uppercase tracking-tighter">
                  Need {Math.max(0, innings.target - innings.total_runs)} from{' '}
                  {Math.max(0, (match.total_overs - innings.total_overs) * 6 - innings.total_balls)} balls
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex-shrink-0">
              {innings?.total_balls === 0 && innings?.total_overs > 0 
                ? `Ov ${innings.total_overs} Complete:` 
                : `Ov ${(innings?.total_overs || 0) + 1}:`}
            </span>
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

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Controls */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 space-y-6 border border-arena-border/50">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Record Delivery</h3>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map(r => (
                  <button key={r} onClick={() => setRuns(r)}
                    className={cn('h-14 rounded-xl font-display text-2xl font-bold transition-all flex items-center justify-center',
                      runs === r
                        ? r === 6 ? 'bg-pitch-500 text-white shadow-glow-green border-pitch-400' : r === 4 ? 'bg-pitch-600 text-white' : 'bg-pitch-600/60 text-white border border-pitch-500'
                        : 'bg-arena-dark border border-arena-border text-gray-300 hover:border-gray-500'
                    )}>
                    {r}
                  </button>
                ))}
                <input type="number" value={runs > 6 ? runs : ''} onChange={e => setRuns(parseInt(e.target.value) || 0)}
                  placeholder="?" min={0}
                  className="py-3 rounded-xl font-display text-lg text-center bg-arena-dark border border-arena-border text-gray-300 focus:outline-none focus:border-pitch-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Extras</h3>
                  <div className="grid grid-cols-4 gap-1.5">
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
                    <div className="mt-3">
                      <label className="text-[9px] text-gray-500 mb-1 block uppercase font-bold">Extra runs</label>
                      <input type="number" value={extras} onChange={e => setExtras(parseInt(e.target.value) || 0)}
                        className="input-arena text-sm h-8" min={0} max={10} />
                    </div>
                  )}
               </div>

               <div>
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Wicket</h3>
                 <button onClick={() => setIsWicket(!isWicket)}
                    className={cn('w-full py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border',
                      isWicket ? 'bg-crimson-600 border-crimson-500 text-white shadow-glow-red' : 'bg-arena-dark border-arena-border text-gray-500 hover:border-crimson-500/50 hover:text-crimson-400'
                    )}>
                    {isWicket ? '🏏 WICKET RECORDED' : 'Mark as Wicket'}
                 </button>
                 {isWicket && (
                   <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {WICKET_TYPES.map(wt => (
                        <button key={wt} onClick={() => setWicketType(wt)}
                          className={cn('py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border',
                            wicketType === wt ? 'bg-crimson-600 border-crimson-500 text-white' : 'bg-arena-dark border-arena-border text-gray-500 hover:border-crimson-500/50'
                          )}>
                          {wt.replace('_', ' ')}
                        </button>
                      ))}
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4 border border-arena-border/50 bg-gradient-to-br from-white/5 to-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Batsman on Strike</label>
                <select value={currentBatsmanId} onChange={e => setBatsman(e.target.value)} className="input-arena text-sm bg-arena-dark/50">
                  <option value="">Select batsman…</option>
                  {battingPlayers.map(mp => (
                    <option key={mp.player_id} value={mp.player_id}>
                      {mp.player?.name} ({mp.player?.role?.replace('_', ' ') || 'Player'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Bowler</label>
                <select value={currentBowlerId} onChange={e => setBowler(e.target.value)} className="input-arena text-sm bg-arena-dark/50">
                  <option value="">Select bowler…</option>
                  {bowlingPlayers.map(mp => (
                    <option key={mp.player_id} value={mp.player_id}>
                      {mp.player?.name} ({mp.player?.role?.replace('_', ' ') || 'Player'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isWicket && ['caught','run_out','stumped'].includes(wicketType) && (
              <div className="mt-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Fielder {wicketType === 'stumped' ? '(Keeper)' : ''}</label>
                <select value={fielderIdForWicket} onChange={e => setFielder(e.target.value)} className="input-arena text-sm bg-arena-dark/50">
                  <option value="">Select fielder…</option>
                  {bowlingPlayers.map(mp => (
                    <option key={mp.player_id} value={mp.player_id}>
                      {mp.player?.name} ({mp.player?.role?.replace('_', ' ') || 'Player'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting || !currentBatsmanId || !currentBowlerId}
              className={cn('w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group',
                !submitting && currentBatsmanId && currentBowlerId
                  ? isWicket ? 'bg-crimson-600 hover:bg-crimson-500 text-white shadow-glow-red border-crimson-400' : 'bg-pitch-600 hover:bg-pitch-500 text-white shadow-glow-green border-pitch-400'
                  : 'bg-arena-card border border-arena-border text-gray-500 cursor-not-allowed opacity-50'
              )}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} className="group-hover:scale-110 transition-transform" />}
              {submitting ? 'Recording…' : 'Record Delivery'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: History & Details */}
        <div className="space-y-4 lg:sticky lg:top-4">
           <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-arena-border/50 flex flex-col max-h-[700px]">
             <div className="px-5 py-4 border-b border-arena-border/50 bg-arena-dark/60 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Match History</h3>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-pitch-400" />
                   <span className="text-[10px] text-gray-500 font-bold uppercase">{balls.length} deliveries</span>
                </div>
             </div>
             <div className="divide-y divide-arena-border/20 overflow-y-auto custom-scrollbar bg-arena-dark/20">
                {overSummaries.map((over) => (
                  <div key={over.number} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-arena-dark border border-arena-border flex items-center justify-center font-bold text-gray-400 text-sm shadow-inner group">
                         <span className="group-hover:text-pitch-400 transition-colors">{over.number + 1}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap max-w-[150px] sm:max-w-none">
                        {[...over.balls].reverse().map((ball: any) => (
                          <div key={ball.id} className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm",
                            getBallColor(ball)
                          )}>
                            {getBallLabel(ball)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-white font-bold text-sm">{over.runs} Runs</div>
                       <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5">
                          {over.wickets > 0 ? (
                            <span className="text-crimson-500">{over.wickets} WICKET{over.wickets > 1 ? 'S' : ''}</span>
                          ) : 'No Wickets'}
                       </div>
                    </div>
                  </div>
                ))}
                {overSummaries.length === 0 && (
                   <div className="p-12 text-center text-gray-600 text-sm italic">
                      Waiting for the first delivery to be recorded...
                   </div>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* Toast flash */}
      <AnimatePresence>
        {lastBall && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn('fixed bottom-6 right-6 px-6 py-3 rounded-xl font-display text-lg shadow-2xl z-50 border',
              lastBall.is_wicket ? 'bg-crimson-600 border-crimson-400 text-white' :
              lastBall.runs === 6 ? 'bg-pitch-500 border-pitch-400 text-white' :
              lastBall.runs === 4 ? 'bg-pitch-600 border-pitch-400 text-white' :
              'bg-arena-card border-arena-border text-white'
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
