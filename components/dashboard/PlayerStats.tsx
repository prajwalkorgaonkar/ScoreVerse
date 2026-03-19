'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target } from 'lucide-react'
import { cn, strikeRate, economy } from '@/lib/utils'

interface Props { balls: any[] }

export default function PlayerStats({ balls }: Props) {
  const [view, setView] = useState<'batting' | 'bowling'>('batting')

  const { batsmen, bowlers } = useMemo(() => {
    const bMap: Record<string, any> = {}
    const wMap: Record<string, any> = {}

    balls.forEach(ball => {
      const bid = ball.batsman?.id
      if (bid && ball.batsman) {
        if (!bMap[bid]) {
          bMap[bid] = {
            player: ball.batsman,
            runs: 0, balls: 0, fours: 0, sixes: 0,
            dismissals: 0, highScore: 0
          }
        }
        if (!ball.extra_type || ball.extra_type === 'no_ball') {
          bMap[bid].balls++
        }
        if (!ball.extra_type) {
          bMap[bid].runs += ball.runs
          if (ball.runs === 4) bMap[bid].fours++
          if (ball.runs === 6) bMap[bid].sixes++
        }
        if (ball.is_wicket) bMap[bid].dismissals++
      }

      const wid = ball.bowler?.id
      if (wid && ball.bowler) {
        if (!wMap[wid]) {
          wMap[wid] = {
            player: ball.bowler,
            wickets: 0, runs: 0, balls: 0, maidens: 0
          }
        }
        wMap[wid].runs += ball.runs + (ball.extras || 0)
        if (!ball.extra_type || ball.extra_type === 'bye' || ball.extra_type === 'leg_bye') {
          wMap[wid].balls++
        }
        if (ball.is_wicket && !['run_out', 'retired'].includes(ball.wicket_type)) {
          wMap[wid].wickets++
        }
      }
    })

    const batsmen = Object.values(bMap)
      .filter(b => b.balls > 0)
      .map(b => ({
        ...b,
        average: b.dismissals > 0 ? (b.runs / b.dismissals).toFixed(1) : b.runs > 0 ? `${b.runs}*` : '0',
        sr: strikeRate(b.runs, b.balls).toFixed(1),
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 20)

    const bowlers = Object.values(wMap)
      .filter(w => w.balls > 0)
      .map(w => ({
        ...w,
        overs: `${Math.floor(w.balls / 6)}.${w.balls % 6}`,
        econ: economy(w.runs, Math.floor(w.balls / 6), w.balls % 6).toFixed(2),
      }))
      .sort((a, b) => b.wickets - a.wickets || parseFloat(a.econ) - parseFloat(b.econ))
      .slice(0, 20)

    return { batsmen, bowlers }
  }, [balls])

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-display text-white tracking-wide">PLAYER <span className="gradient-text">STATS</span></h1>
        <p className="text-gray-500 mt-1">Aggregated from all match deliveries</p>
      </div>

      <div className="flex gap-1 p-1 bg-arena-card rounded-xl border border-arena-border w-fit">
        {(['batting', 'bowling'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'px-6 py-2.5 text-sm font-medium rounded-lg capitalize transition-all',
              view === v ? 'bg-pitch-600 text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'batting' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-arena-border flex items-center gap-2">
            <TrendingUp size={16} className="text-pitch-400" />
            <span className="font-semibold text-white">Batting Leaderboard</span>
          </div>
          {batsmen.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No batting data yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="arena-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>Avg</th>
                    <th>SR</th>
                  </tr>
                </thead>
                <tbody>
                  {batsmen.map((b, i) => (
                    <tr key={b.player.id}>
                      <td className="text-gray-500">{i + 1}</td>
                      <td className="font-medium text-white">{b.player.name}</td>
                      <td>
                        <span className="text-xs" style={{ color: b.player.team?.color }}>{b.player.team?.short_name}</span>
                      </td>
                      <td className={cn('font-bold font-display', i === 0 ? 'text-amber-400' : 'text-white')}>{b.runs}</td>
                      <td className="text-gray-400">{b.balls}</td>
                      <td className="text-pitch-400">{b.fours}</td>
                      <td className="text-pitch-300">{b.sixes}</td>
                      <td className="text-gray-300">{b.average}</td>
                      <td className="text-gray-300 font-mono text-xs">{b.sr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {view === 'bowling' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-arena-border flex items-center gap-2">
            <Target size={16} className="text-blue-400" />
            <span className="font-semibold text-white">Bowling Leaderboard</span>
          </div>
          {bowlers.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No bowling data yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="arena-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Wkts</th>
                    <th>Overs</th>
                    <th>Runs</th>
                    <th>Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {bowlers.map((b, i) => (
                    <tr key={b.player.id}>
                      <td className="text-gray-500">{i + 1}</td>
                      <td className="font-medium text-white">{b.player.name}</td>
                      <td>
                        <span className="text-xs" style={{ color: b.player.team?.color }}>{b.player.team?.short_name}</span>
                      </td>
                      <td className={cn('font-bold font-display', i === 0 ? 'text-crimson-400' : 'text-white')}>{b.wickets}</td>
                      <td className="text-gray-400 font-mono text-xs">{b.overs}</td>
                      <td className="text-gray-400">{b.runs}</td>
                      <td className={cn('font-mono text-xs', parseFloat(b.econ) < 7 ? 'text-pitch-400' : parseFloat(b.econ) > 10 ? 'text-crimson-400' : 'text-gray-300')}>
                        {b.econ}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {balls.length === 0 && (
        <div className="glass-card rounded-2xl py-16 text-center">
          <BarChart3 size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No delivery data yet</p>
          <p className="text-gray-600 text-sm mt-1">Stats will appear once matches are scored</p>
        </div>
      )}
    </div>
  )
}
