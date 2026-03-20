"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Download, Copy, ArrowLeft, Loader2 } from 'lucide-react'
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

  // Batting
  const batsmanMap: Record<string, any> = {}
  inningsBalls.forEach(ball => {
    const bid = ball.batsman_id
    if (!batsmanMap[bid]) {
      batsmanMap[bid] = {
        id: bid,
        name: ball.batsman?.name || 'Unknown',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false,
        dismissal: ''
      }
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

  // Bowling
  const bowlerMap: Record<string, any> = {}
  inningsBalls.forEach(ball => {
    const wid = ball.bowler_id
    if (!bowlerMap[wid]) {
      bowlerMap[wid] = {
        id: wid,
        name: ball.bowler?.name || 'Unknown',
        runs: 0,
        balls: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0
      }
    }
    bowlerMap[wid].runs += ball.runs + (ball.extras || 0)
    if (!ball.extra_type || ball.extra_type === 'bye' || ball.extra_type === 'leg_bye') bowlerMap[wid].balls++
    if (ball.extra_type === 'wide') bowlerMap[wid].wides++
    if (ball.extra_type === 'no_ball') bowlerMap[wid].noBalls++
    if (ball.is_wicket && ball.wicket_type !== 'run_out') bowlerMap[wid].wickets++
  })

  // ✅ FINAL FIX (important)
  const handleExportPDF = async () => {
  setExporting(true)

  try {
    const mod = await import('@/lib/pdfClient')
    await mod.generatePDF(match, innings, balls)

    toast.success('Scorecard exported!')
  } catch (err) {
    console.error(err)
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
      <div className="flex justify-between">
        <div>
          {role !== 'public' && (
            <Link href={`${base}/matches`} className="text-sm text-gray-400 flex gap-1 items-center">
              <ArrowLeft size={14} />
              Back
            </Link>
          )}
          <h1 className="text-2xl text-white mt-2">
            {match.team1?.short_name} VS {match.team2?.short_name}
          </h1>
        </div>

        <div className="flex gap-2">
          <button onClick={copyShareLink} className="px-3 py-2 border rounded text-sm">
            <Copy size={14} />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="px-3 py-2 bg-green-600 text-white rounded text-sm"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          </button>
        </div>
      </div>

      {/* Score */}
      {currentInnings && (
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-white text-xl">
            {currentInnings.total_runs}/{currentInnings.total_wickets}
          </h2>
          <p className="text-gray-400 text-sm">
            {currentInnings.total_overs}.{currentInnings.total_balls} overs
          </p>
        </div>
      )}

    </div>
  )
}