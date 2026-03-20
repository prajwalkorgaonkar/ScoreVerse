'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Radio, Share2, RefreshCw, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getBallColor, getBallLabel, calculateRunRate, calculateRequiredRunRate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  match: any
  currentInnings: any
  innings1: any
  innings2: any
  allBalls: any[]
  token: string
}

export default function PublicLiveView({ match, currentInnings: initInnings, innings1: initI1, innings2: initI2, allBalls: initBalls, token }: Props) {
  const supabase = createClient()
  const [innings, setInnings] = useState(initInnings)
  const [innings1, setInnings1] = useState(initI1)
  const [innings2, setInnings2] = useState(initI2)
  const [balls, setBalls] = useState(initBalls)
  const [matchStatus, setMatchStatus] = useState(match.status)
  const [lastBallFlash, setLastBallFlash] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<1 | 2 | 'info'>(match.current_innings || 1)

  const activeInnings = activeTab === 1 ? innings1 : activeTab === 2 ? innings2 : null
  const activeBattingTeam = match.team1_id === activeInnings?.batting_team_id ? match.team1 : match.team2
  const activeBowlingTeam = match.team1_id === activeInnings?.bowling_team_id ? match.team1 : match.team2
  
  const activeInningsBalls = balls.filter((b: any) => b.innings_id === activeInnings?.id)

  // Fast batting algorithm
  const batsmanMap: Record<string, any> = {}
  activeInningsBalls.forEach((ball: any) => {
    const bid = ball.batsman_id
    if (!batsmanMap[bid]) {
      batsmanMap[bid] = { id: bid, name: ball.batsman?.name || 'Unknown', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: '' }
    }
    if (!ball.extra_type || ball.extra_type === 'no_ball') batsmanMap[bid].balls++
    if (!ball.extra_type) {
      batsmanMap[bid].runs += ball.runs
      if (ball.runs === 4) batsmanMap[bid].fours++
      if (ball.runs === 6) batsmanMap[bid].sixes++
    }
    if (ball.is_wicket) {
      batsmanMap[bid].out = true
      batsmanMap[bid].dismissal = ball.wicket_type?.replace('_', ' ') || 'out'
    }
  })

  // Fast bowling algorithm
  const bowlerMap: Record<string, any> = {}
  activeInningsBalls.forEach((ball: any) => {
    const wid = ball.bowler_id
    if (!bowlerMap[wid]) {
      bowlerMap[wid] = { id: wid, name: ball.bowler?.name || 'Unknown', runs: 0, balls: 0, wickets: 0, wides: 0, noBalls: 0 }
    }
    bowlerMap[wid].runs += ball.runs + (ball.extras || 0)
    if (!ball.extra_type || ball.extra_type === 'bye' || ball.extra_type === 'leg_bye') bowlerMap[wid].balls++
    if (ball.extra_type === 'wide') bowlerMap[wid].wides++
    if (ball.extra_type === 'no_ball') bowlerMap[wid].noBalls++
    if (ball.is_wicket && ball.wicket_type !== 'run_out') bowlerMap[wid].wickets++
  })

  const battingTeam = match.team1_id === innings?.batting_team_id ? match.team1 : match.team2
  const bowlingTeam = match.team1_id === innings?.bowling_team_id ? match.team1 : match.team2
  const team1 = match.team1
  const team2 = match.team2

  const crr = calculateRunRate(innings?.total_runs || 0, innings?.total_overs || 0, innings?.total_balls || 0)
  const rrr = innings?.target
    ? calculateRequiredRunRate(innings.target, innings.total_runs, match.total_overs, innings.total_overs, innings.total_balls)
    : null

  // Calculate current partnership
  const lastWicketIndex = activeInningsBalls.findIndex((b: any) => b.is_wicket)
  const partnershipBallsList = lastWicketIndex === -1 ? activeInningsBalls : activeInningsBalls.slice(0, lastWicketIndex)
  const partnershipRuns = partnershipBallsList.reduce((acc: number, b: any) => acc + b.runs + (b.extras || 0), 0)
  const partnershipBallsCount = partnershipBallsList.filter((b: any) => !b.extra_type || ['bye', 'leg_bye', 'no_ball'].includes(b.extra_type)).length

  useEffect(() => {
    const channel = supabase.channel(`public-${token}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'balls', filter: `innings_id=eq.${innings?.id}` },
        (payload) => {
          setBalls((prev: any[]) => {
            if (prev.find(b => b.id === payload.new.id)) return prev
            return [payload.new, ...prev]
          })
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
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-6 space-y-4">
        
        {/* Tournament & Share & Live Status */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-3">
             {matchStatus === 'live' && (
               <div className="flex items-center gap-1.5 bg-arena-card/50 px-3 py-1.5 rounded-lg border border-arena-border">
                 <span className="live-dot" />
                 <span className="text-crimson-400 text-xs font-semibold">LIVE</span>
               </div>
             )}
             {match.tournament && (
               <span className="text-xs text-gray-400 font-medium uppercase tracking-wider bg-arena-card/50 px-3 py-1.5 rounded-lg border border-arena-border">
                 {match.tournament.name}
               </span>
             )}
           </div>
           
           <button onClick={share} className="flex items-center gap-2 px-3 py-1.5 bg-arena-card/50 hover:bg-arena-border/30 text-gray-300 text-xs font-medium rounded-lg border border-arena-border transition-colors">
             <Share2 size={14} />
             Share
           </button>
        </div>

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

            {/* Batting team score -> Now Dual Team View */}
            {innings && (
              <div className="space-y-6">
                {/* Dual Team Score Banner */}
                <div className="flex items-center justify-between">
                  {/* Team 1 Side */}
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1" style={{ color: team1?.color }}>
                      {team1?.short_name}
                      {innings?.batting_team_id === team1?.id && matchStatus !== 'completed' && (
                        <span className="text-crimson-500 ml-2 text-[10px] uppercase font-bold tracking-wider">Batting</span>
                      )}
                    </div>
                    {(() => {
                      const t1Inn = match.innings?.find((i: any) => i.batting_team_id === team1?.id);
                      if (t1Inn || (innings?.batting_team_id === team1?.id)) {
                        const activeInn = t1Inn || innings;
                        return (
                          <>
                            <motion.div key={activeInn.total_runs + 't1'} className="text-4xl sm:text-5xl font-display text-white" animate={innings?.batting_team_id === team1?.id ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.3 }}>
                              {activeInn.total_runs}/{activeInn.total_wickets}
                            </motion.div>
                            <div className="text-xs text-gray-500 mt-1">({activeInn.total_overs}.{activeInn.total_balls} ov)</div>
                          </>
                        )
                      }
                      return <div className="text-gray-600 text-sm mt-3 font-medium">Yet to bat</div>
                    })()}
                  </div>

                  {/* VS Divider */}
                  <div className="px-4 text-center flex flex-col items-center justify-center opacity-40">
                    <div className="w-px h-6 bg-arena-border mb-2" />
                    <span className="text-xs font-display tracking-widest text-gray-400">VS</span>
                    <div className="w-px h-6 bg-arena-border mt-2" />
                  </div>

                  {/* Team 2 Side */}
                  <div className="flex-1 text-right">
                    <div className="text-sm font-medium mb-1" style={{ color: team2?.color }}>
                      {innings?.batting_team_id === team2?.id && matchStatus !== 'completed' && (
                        <span className="text-crimson-500 mr-2 text-[10px] uppercase font-bold tracking-wider">Batting</span>
                      )}
                      {team2?.short_name}
                    </div>
                    {(() => {
                      const t2Inn = match.innings?.find((i: any) => i.batting_team_id === team2?.id);
                      if (t2Inn || (innings?.batting_team_id === team2?.id)) {
                        const activeInn = t2Inn || innings;
                        return (
                          <>
                            <motion.div key={activeInn.total_runs + 't2'} className="text-4xl sm:text-5xl font-display text-white" animate={innings?.batting_team_id === team2?.id ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.3 }}>
                              {activeInn.total_runs}/{activeInn.total_wickets}
                            </motion.div>
                            <div className="text-xs text-gray-500 mt-1">({activeInn.total_overs}.{activeInn.total_balls} ov)</div>
                          </>
                        )
                      }
                      return <div className="text-gray-600 text-sm mt-3 font-medium">Yet to bat</div>
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 mt-6">
                  <div className="flex flex-col bg-arena-dark/50 border border-arena-border px-4 py-2 rounded-xl text-center">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">CRR</span>
                    <span className="text-white font-mono font-medium text-lg">{crr.toFixed(2)}</span>
                  </div>
                  {rrr !== null && (
                    <div className="flex flex-col bg-arena-dark/50 border border-arena-border px-4 py-2 rounded-xl text-center">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">REQ RR</span>
                      <span className={rrr > 12 ? 'text-crimson-400 font-mono font-medium text-lg' : 'text-pitch-400 font-mono font-medium text-lg'}>
                        {rrr.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {innings.extras > 0 && (
                    <div className="flex flex-col bg-arena-dark/50 border border-arena-border px-4 py-2 rounded-xl text-center">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Extras</span>
                      <span className="text-gray-300 font-mono font-medium text-lg">{innings.extras}</span>
                    </div>
                  )}
                </div>

                {matchStatus === 'completed' ? (
                  <div className="mt-2 p-3 bg-pitch-500/10 border border-pitch-500/20 rounded-xl flex items-center justify-between">
                    <span className="text-pitch-400 font-medium">
                      {match.is_tie ? 'Match Tied!' :
                       match.win_by_runs ? `${match.winner_team_id === match.team1_id ? team1?.name : team2?.name} won by ${match.win_by_runs} runs` :
                       `${match.winner_team_id === match.team1_id ? team1?.name : team2?.name} won by ${match.win_by_wickets} wickets`}
                    </span>
                  </div>
                ) : innings.target ? (
                  <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="text-amber-400 font-medium">
                      Target: {innings.target} · Need {Math.max(0, innings.target - innings.total_runs)} from{' '}
                      {Math.max(0, (match.total_overs - innings.total_overs) * 6 - innings.total_balls)} balls
                    </span>
                  </div>
                ) : matchStatus === 'innings_break' && innings1 ? (
                   <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                     <span className="text-amber-400 font-medium">
                       Target set to {innings1.total_runs + 1}
                     </span>
                   </div>
                ) : null}

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
            )}
          </div>
        </motion.div>

        {/* Full Scorecard Selector */}
        <div className="glass-card rounded-xl p-2 flex gap-2 w-fit mt-6 overflow-x-auto">
          {innings1 && (
            <button
              onClick={() => setActiveTab(1)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 1 ? 'bg-pitch-600 text-white shadow-glow-green' : 'text-gray-400 hover:text-white'
              }`}
            >
              1st Innings
            </button>
          )}
          {innings2 && (
            <button
              onClick={() => setActiveTab(2)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 2 ? 'bg-pitch-600 text-white shadow-glow-green' : 'text-gray-400 hover:text-white'
              }`}
            >
              2nd Innings
            </button>
          )}
          <button
            onClick={() => setActiveTab('info')}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'info' ? 'bg-pitch-600 text-white shadow-glow-green' : 'text-gray-400 hover:text-white'
            }`}
          >
            About
          </button>
        </div>

        {/* Info & About Section */}
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
              {match.tournament && (
                <div className="glass-card rounded-2xl p-6 border border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="text-amber-400" size={24} />
                      <h3 className="text-xl font-display text-white">{match.tournament.name}</h3>
                    </div>
                    {match.tournament.description && (
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                        {match.tournament.description}
                      </p>
                    )}
                    <a
                      href={`/tournament/public/${match.tournament.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-glow-green/20"
                    >
                      View Tournament Hub
                    </a>
                  </div>
                </div>
              )}
              
              <div className="glass-card rounded-2xl p-6 border border-arena-border/50">
                <h3 className="text-lg font-semibold text-white mb-4">Match Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-gray-500 mb-1">Venue</span>
                    <span className="text-white font-medium">{match.venue || 'TBA'}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Format</span>
                    <span className="text-white font-medium">{match.total_overs} Overs</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Squads</span>
                    <span className="text-white font-medium">{match.players_per_team} Players</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Toss</span>
                    <span className="text-white font-medium">
                      {match.toss_winner_id ? `${match.toss_winner_id === match.team1_id ? match.team1?.short_name : match.team2?.short_name} chose to ${match.toss_choice}` : 'Pending'}
                    </span>
                  </div>
                </div>

                {match.description && (
                  <div className="mt-6 pt-6 border-t border-arena-border/50">
                    <span className="block text-gray-500 mb-2 font-medium">About this Match</span>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {match.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        {/* Live Active Scorecard */}
        {activeTab !== 'info' && activeInnings && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
            
            {/* Batting Card */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-arena-border/50">
              <div className="px-5 py-4 border-b border-arena-border/50 bg-arena-dark/40 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Batting — <span style={{ color: activeBattingTeam?.color }}>{activeBattingTeam?.name}</span></h3>
              </div>
              <div className="overflow-x-auto">
                <table className="arena-table w-full whitespace-nowrap">
                  <thead>
                    <tr>
                      <th className="pl-5 text-left text-xs text-gray-400 uppercase tracking-widest py-3 font-semibold">Batsman</th>
                      <th className="text-left text-xs text-gray-400 uppercase tracking-widest font-semibold">Status</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">R</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">B</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">4s</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">6s</th>
                      <th className="pr-5 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-16">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(batsmanMap).map((b: any) => (
                      <tr key={b.id} className="border-t border-arena-border/30 hover:bg-white/5 transition-colors">
                        <td className="pl-5 py-3 font-medium text-white">{b.name}</td>
                        <td className="py-3 text-gray-500 text-xs capitalize">{b.out ? b.dismissal : <span className="text-pitch-400 font-medium">not out</span>}</td>
                        <td className="text-center py-3 font-bold text-white text-base">{b.runs}</td>
                        <td className="text-center py-3 text-gray-400 text-sm">{b.balls}</td>
                        <td className="text-center py-3 text-pitch-400 text-sm">{b.fours}</td>
                        <td className="text-center py-3 text-pitch-300 text-sm">{b.sixes}</td>
                        <td className="text-center pr-5 py-3 text-gray-400 font-mono text-xs font-semibold">
                          {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '-'}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(batsmanMap).length === 0 && (
                      <tr><td colSpan={7} className="text-center py-6 text-gray-500 italic text-sm">No batters recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowling Card */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-arena-border/50 mb-6">
              <div className="px-5 py-4 border-b border-arena-border/50 bg-arena-dark/40 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bowling — <span style={{ color: activeBowlingTeam?.color }}>{activeBowlingTeam?.name}</span></h3>
              </div>
              <div className="overflow-x-auto">
                <table className="arena-table w-full whitespace-nowrap">
                  <thead>
                    <tr>
                      <th className="pl-5 text-left text-xs text-gray-400 uppercase tracking-widest py-3 font-semibold">Bowler</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">O</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">M</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">R</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-12">W</th>
                      <th className="pr-5 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold w-16">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(bowlerMap).map((b: any) => {
                      const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`
                      const econ = b.balls > 0 ? ((b.runs / (b.balls / 6))).toFixed(2) : '0.00'
                      return (
                        <tr key={b.id} className="border-t border-arena-border/30 hover:bg-white/5 transition-colors">
                          <td className="pl-5 py-3 font-medium text-white">{b.name}</td>
                          <td className="text-center py-3 text-gray-400 font-mono text-sm">{overs}</td>
                          <td className="text-center py-3 text-gray-500 font-mono text-sm">0</td>
                          <td className="text-center py-3 text-gray-300 font-mono text-sm">{b.runs}</td>
                          <td className="text-center py-3 font-bold text-white text-base">{b.wickets}</td>
                          <td className="text-center pr-5 py-3 font-mono text-xs font-semibold">
                            <span className={parseFloat(econ) < 7 ? 'text-pitch-400' : parseFloat(econ) > 10 ? 'text-crimson-400' : 'text-gray-400'}>
                              {econ}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {Object.keys(bowlerMap).length === 0 && (
                      <tr><td colSpan={6} className="text-center py-6 text-gray-500 italic text-sm">No bowlers recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}
        </AnimatePresence>

        {activeTab !== 'info' && activeInnings && (
          <div className="glass-card rounded-xl px-5 py-4 border border-arena-border/50 flex items-center justify-between mt-4 bg-gradient-to-r from-pitch-600/10 to-transparent">
            <span className="text-sm font-semibold text-pitch-400 uppercase tracking-wider">Current Partnership</span>
            <span className="text-white font-display text-xl">{partnershipRuns} <span className="text-sm font-mono text-gray-400">({partnershipBallsCount} balls)</span></span>
          </div>
        )}

        {/* Recent deliveries */}
        <div className="glass-card rounded-xl p-5 mt-6">
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
          Powered by <span className="text-pitch-400 font-medium">ScoreVerse</span> · All rights reserved to{' '}
          <span className="text-pitch-400">Prajwal Korgaonkar</span>
        </p>
      </footer>
    </div>
  )
}
