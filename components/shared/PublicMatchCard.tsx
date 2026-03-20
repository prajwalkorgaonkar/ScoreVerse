import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Activity, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PublicMatchCard({ match }: { match: any }) {
  const isLive = match.status === 'live' || match.status === 'innings_break'
  
  // Format innings
  const inn1 = match.innings?.find((i: any) => i.innings_number === 1)
  const inn2 = match.innings?.find((i: any) => i.innings_number === 2)
  const t1Inn = match.innings?.find((i: any) => i.batting_team_id === match.team1?.id)
  const t2Inn = match.innings?.find((i: any) => i.batting_team_id === match.team2?.id)
  
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
            <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: match.team1?.color || '#333' }} />
            <span className="text-white font-medium text-lg">{match.team1?.name}</span>
          </div>
          {t1Inn && (
            <div className="text-right">
              <span className="text-xl font-display text-white">{t1Inn.total_runs}/{t1Inn.total_wickets}</span>
              <span className="text-xs text-gray-500 ml-2 font-mono">({Math.floor(t1Inn.total_balls / 6)}.{t1Inn.total_balls % 6} ov)</span>
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: match.team2?.color || '#333' }} />
            <span className="text-white font-medium text-lg">{match.team2?.name}</span>
          </div>
          {t2Inn && (
            <div className="text-right">
              <span className="text-xl font-display text-white">{t2Inn.total_runs}/{t2Inn.total_wickets}</span>
              <span className="text-xs text-gray-500 ml-2 font-mono">({Math.floor(t2Inn.total_balls / 6)}.{t2Inn.total_balls % 6} ov)</span>
            </div>
          )}
        </div>
      </div>

      {/* Result Footer */}
      {match.status === 'completed' && match.winner_team_id && (
        <div className="mt-5 pt-3 border-t border-arena-border">
          <p className="text-sm font-semibold text-pitch-400">
            {match.winner_team_id === match.team1?.id ? match.team1?.short_name : match.team2?.short_name} won by{' '}
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
        <div className="mt-4 pt-3 border-t border-arena-border flex justify-between items-center text-xs">
          <span className="text-gray-400">Current Run Rate</span>
          <span className="font-mono text-white font-medium">
            {(() => {
              const activeInn = inn2 || inn1
              if (!activeInn) return '0.00'
              const overs = activeInn.total_overs + (activeInn.total_balls % 6) / 10
              return overs > 0 ? (activeInn.total_runs / overs).toFixed(2) : '0.00'
            })()}
          </span>
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
