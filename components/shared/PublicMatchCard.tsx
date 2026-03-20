'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Trophy, Activity, CalendarClock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, getBallColor, getBallLabel } from '@/lib/utils'

export default function PublicMatchCard({ match }: { match: any }) {
  const [localBalls, setLocalBalls] = useState<any[]>([])
  const supabase = createClient()
  
  // Supabase joins can sometimes return an array for single relationships if not hinted correctly
  const normalize = (obj: any) => Array.isArray(obj) ? obj[0] : obj
  const team1 = normalize(match.team1)
  const team2 = normalize(match.team2)
  
  const isLive = match.status === 'live' || match.status === 'innings_break' || match.status === 'toss'
  
  // Format innings
  const inn1 = match.innings?.find((i: any) => i.innings_number === 1)
  const inn2 = match.innings?.find((i: any) => i.innings_number === 2)
  const activeInnings = (match.status === 'live' || match.status === 'innings_break') ? (inn2 || inn1) : null
  
  const t1Inn = match.innings?.find((i: any) => i.batting_team_id === team1?.id)
  const t2Inn = match.innings?.find((i: any) => i.batting_team_id === team2?.id)

  // Fetch initial balls if they aren't provided by parent
  useEffect(() => {
    if (activeInnings && (!activeInnings.balls || activeInnings.balls.length === 0)) {
      supabase
        .from('balls')
        .select('id, runs, extra_type, wicket_type')
        .eq('innings_id', activeInnings.id)
        .order('created_at', { ascending: false })
        .limit(6)
        .then(({ data }) => {
          if (data) setLocalBalls(data)
        })
    }
  }, [activeInnings?.id])
  
  return (
    <Link 
      href={`/match/live/${match.share_token}`}
      className="block glass-card rounded-2xl p-5 hover:border-pitch-600/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Top Banner */}
      {isLive && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-crimson-600 to-pitch-500" />}
      
      <div className="flex items-center justify-between mb-4">
        {isLive ? (
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-crimson-400 text-xs font-bold tracking-wide uppercase">LIVE</span>
          </div>
        ) : match.status === 'toss' ? (
          <div className="flex items-center gap-1.5 text-amber-500">
            <Activity size={12} className="animate-pulse" />
            <span className="text-xs font-bold tracking-wide uppercase">TOSS DONE</span>
          </div>
        ) : match.status === 'completed' ? (
          <div className="flex items-center gap-1.5 text-pitch-500">
            <Trophy size={14} />
            <span className="text-xs font-bold tracking-wide uppercase">COMPLETED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-500">
            <CalendarClock size={14} />
            <span className="text-xs font-semibold tracking-wide uppercase">SCHEDULED</span>
          </div>
        )}
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider bg-arena-dark px-2 py-1 rounded">
          {match.total_overs} Overs
        </span>
      </div>

      <div className="space-y-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: team1?.color || '#333' }} />
            <span className="text-cyan-400 font-semibold text-lg">{team1?.name}</span>
          </div>
          {(() => {
            const hasData = t1Inn || (match.status === 'live' && match.batting_team_id === team1?.id)
            if (!hasData && match.status !== 'completed' && match.status !== 'innings_break') return null
            
            const inn = t1Inn || { total_runs: 0, total_wickets: 0, total_balls: 0 }
            return (
              <div className="text-right">
                <span className="text-2xl font-display text-white">{inn.total_runs}/{inn.total_wickets}</span>
                <span className="text-[10px] text-gray-500 ml-2 font-mono">({inn.total_overs}.{inn.total_balls} ov)</span>
              </div>
            )
          })()}
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: team2?.color || '#333' }} />
            <span className="text-amber-400 font-semibold text-lg">{team2?.name}</span>
          </div>
          {(() => {
            const hasData = t2Inn || (match.status === 'live' && match.batting_team_id === team2?.id)
            if (!hasData && match.status !== 'completed' && match.status !== 'innings_break') return null
            
            const inn = t2Inn || { total_runs: 0, total_wickets: 0, total_balls: 0 }
            return (
              <div className="text-right">
                <span className="text-2xl font-display text-white">{inn.total_runs}/{inn.total_wickets}</span>
                <span className="text-[10px] text-gray-500 ml-2 font-mono">({inn.total_overs}.{inn.total_balls} ov)</span>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Result Footer */}
      {match.status === 'completed' && match.winner_team_id && (
        <div className="mt-5 pt-3 border-t border-arena-border">
          <p className="text-sm font-semibold text-pitch-400 uppercase tracking-wide">
            {match.winner_team_id === team1?.id ? team1?.short_name : team2?.short_name} won by{' '}
            {match.win_by_runs ? `${match.win_by_runs} runs` : `${match.win_by_wickets} wickets`}
          </p>
        </div>
      )}
      
      {match.status === 'completed' && match.is_tie && (
        <div className="mt-5 pt-3 border-t border-arena-border">
          <p className="text-sm font-semibold text-amber-400">Match tied</p>
        </div>
      )}

      {isLive && match.status !== 'innings_break' && (
        <div className="mt-4 pt-4 border-t border-arena-border space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Current Run Rate</span>
            <span className="font-mono text-white font-medium">
              {(() => {
                const activeInn = inn2 || inn1
                if (!activeInn) return '0.00'
                const totalBallsBowled = activeInn.total_overs * 6 + activeInn.total_balls
                return totalBallsBowled > 0 ? (activeInn.total_runs / (totalBallsBowled / 6)).toFixed(2) : '0.00'
              })()}
            </span>
          </div>
          
          {/* Recent Balls Strip */}
          {(() => {
            const recentBalls = (activeInnings?.balls && activeInnings.balls.length > 0) 
              ? activeInnings.balls 
              : localBalls
              
            if (recentBalls.length === 0) return null
            
            return (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[10px] text-gray-500 uppercase font-bold mr-1">Recent</span>
                {recentBalls.map((ball: any) => (
                  <div 
                    key={ball.id}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-lg border border-white/5",
                      getBallColor(ball)
                    )}
                  >
                    {getBallLabel(ball)}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
      
      {match.status === 'innings_break' && Object.keys(inn1 || {}).length > 0 && (
         <div className="mt-4 pt-3 border-t border-arena-border flex justify-between items-center text-xs text-amber-500 font-medium">
            Target set to {inn1.total_runs + 1}
         </div>
      )}
    </Link>
  )
}
