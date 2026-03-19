'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Download, Share2, Copy, ArrowLeft, Loader2 } from 'lucide-react'
import { cn, getBallColor, getBallLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  match: any
  innings: any[]
  balls: any[]
  role: string
}

export default function MatchScorecard({ match, innings, balls, role }: Props) {
  const [exporting, setExporting] = useState(false)
  const [activeInnings, setActiveInnings] = useState(1)

  const base = role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'

  const currentInnings = innings.find(i => i.innings_number === activeInnings)
  const inningsBalls = balls.filter(b => b.innings_id === currentInnings?.id)

  // Calculate batting scorecard from balls
  const batsmanMap: Record<string, any> = {}
  inningsBalls.forEach(ball => {
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

  // Calculate bowling from balls
  const bowlerMap: Record<string, any> = {}
  inningsBalls.forEach(ball => {
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

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const { exportScorecardPDF } = await import('@/lib/exportPDF')
      await exportScorecardPDF(match, innings, balls)
      toast.success('Scorecard exported!')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/match/live/${match.share_token}`
    navigator.clipboard.writeText(url)
    toast.success('Share link copied!')
  }

  const battingTeam = match.team1_id === currentInnings?.batting_team_id ? match.team1 : match.team2
  const bowlingTeam = match.team1_id === currentInnings?.bowling_team_id ? match.team1 : match.team2

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href={`${base}/matches`} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft size={14} />
            Back to matches
          </Link>
          <h1 className="text-3xl font-display text-white tracking-wide">
            <span style={{ color: match.team1?.color }}>{match.team1?.short_name}</span>
            <span className="text-gray-600 mx-3">VS</span>
            <span style={{ color: match.team2?.color }}>{match.team2?.short_name}</span>
          </h1>
          {match.tournament && <p className="text-gray-500 text-sm mt-1">{match.tournament.name} · {match.total_overs} Overs</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyShareLink} className="flex items-center gap-2 px-4 py-2 border border-arena-border hover:border-gray-500 text-gray-400 hover:text-white text-sm rounded-xl transition-colors">
            <Copy size={14} />
            Copy Link
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-pitch-600 hover:bg-pitch-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export PDF
          </button>
        </div>
      </div>

      {/* Result Banner */}
      {match.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-5 border border-pitch-500/20 bg-pitch-500/5 text-center"
        >
          <div className="text-2xl font-display text-white mb-1">
            {match.is_tie ? 'MATCH TIED' : (
              <>
                <span style={{ color: match.winner_team_id === match.team1_id ? match.team1?.color : match.team2?.color }}>
                  {match.winner_team_id === match.team1_id ? match.team1?.name : match.team2?.name}
                </span>
                {' '}WON
              </>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            {match.win_by_runs ? `by ${match.win_by_runs} runs` : match.win_by_wickets ? `by ${match.win_by_wickets} wickets` : ''}
          </p>
        </motion.div>
      )}

      {/* Innings tabs */}
      {innings.length > 1 && (
        <div className="flex gap-1 p-1 bg-arena-card rounded-xl border border-arena-border w-fit">
          {innings.map(inn => (
            <button
              key={inn.innings_number}
              onClick={() => setActiveInnings(inn.innings_number)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-lg transition-all',
                activeInnings === inn.innings_number ? 'bg-pitch-600 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              {inn.innings_number === 1 ? '1st Innings' : '2nd Innings'}
            </button>
          ))}
        </div>
      )}

      {currentInnings && (
        <motion.div key={activeInnings} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Innings summary */}
          <div className="glass-card rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="text-sm mb-1" style={{ color: battingTeam?.color }}>{battingTeam?.name} batting</div>
              <div className="text-4xl font-display text-white">
                {currentInnings.total_runs}/{currentInnings.total_wickets}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {currentInnings.total_overs}.{currentInnings.total_balls} overs
                {currentInnings.extras > 0 && ` · Extras: ${currentInnings.extras}`}
              </div>
            </div>
            {currentInnings.target && (
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Target</div>
                <div className="text-3xl font-display text-amber-400">{currentInnings.target}</div>
              </div>
            )}
          </div>

          {/* Batting Scorecard */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-arena-border">
              <h3 className="text-sm font-semibold text-white">Batting</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="arena-table">
                <thead>
                  <tr>
                    <th>Batsman</th>
                    <th>Dismissal</th>
                    <th className="text-center">R</th>
                    <th className="text-center">B</th>
                    <th className="text-center">4s</th>
                    <th className="text-center">6s</th>
                    <th className="text-center">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(batsmanMap).map((b: any) => (
                    <tr key={b.id}>
                      <td className="font-medium text-white">{b.name}</td>
                      <td className="text-gray-500 text-xs capitalize">{b.out ? b.dismissal : <span className="text-pitch-400">not out</span>}</td>
                      <td className="text-center font-bold text-white">{b.runs}</td>
                      <td className="text-center text-gray-400">{b.balls}</td>
                      <td className="text-center text-pitch-400">{b.fours}</td>
                      <td className="text-center text-pitch-300">{b.sixes}</td>
                      <td className="text-center text-gray-400 font-mono text-xs">
                        {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bowling Scorecard */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-arena-border">
              <h3 className="text-sm font-semibold text-white">Bowling — <span style={{ color: bowlingTeam?.color }}>{bowlingTeam?.name}</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="arena-table">
                <thead>
                  <tr>
                    <th>Bowler</th>
                    <th className="text-center">O</th>
                    <th className="text-center">R</th>
                    <th className="text-center">W</th>
                    <th className="text-center">Econ</th>
                    <th className="text-center">Wd</th>
                    <th className="text-center">Nb</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(bowlerMap).map((b: any) => {
                    const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`
                    const econ = b.balls > 0 ? ((b.runs / (b.balls / 6))).toFixed(2) : '0.00'
                    return (
                      <tr key={b.id}>
                        <td className="font-medium text-white">{b.name}</td>
                        <td className="text-center font-mono text-xs text-gray-400">{overs}</td>
                        <td className="text-center text-gray-300">{b.runs}</td>
                        <td className={cn('text-center font-bold', b.wickets > 0 ? 'text-crimson-400' : 'text-gray-400')}>{b.wickets}</td>
                        <td className={cn('text-center font-mono text-xs', parseFloat(econ) < 7 ? 'text-pitch-400' : parseFloat(econ) > 10 ? 'text-crimson-400' : 'text-gray-400')}>
                          {econ}
                        </td>
                        <td className="text-center text-amber-400">{b.wides}</td>
                        <td className="text-center text-amber-400">{b.noBalls}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Over-by-over */}
          {inningsBalls.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Over Summary</h3>
              <div className="space-y-2">
                {Array.from({ length: currentInnings.total_overs + (currentInnings.total_balls > 0 ? 1 : 0) }, (_, ov) => {
                  const overBalls = inningsBalls.filter(b => b.over_number === ov)
                  const overRuns = overBalls.reduce((s, b) => s + b.runs + (b.extras || 0), 0)
                  const overWickets = overBalls.filter(b => b.is_wicket).length
                  return (
                    <div key={ov} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-12">Ov {ov + 1}</span>
                      <div className="flex gap-1.5">
                        {overBalls.slice(0, 6).map((ball, bi) => (
                          <div
                            key={ball.id || bi}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getBallColor(ball)}`}
                          >
                            {getBallLabel(ball)}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">
                        {overRuns} runs {overWickets > 0 && <span className="text-crimson-400">{overWickets}W</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
