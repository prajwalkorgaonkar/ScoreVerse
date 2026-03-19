import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOvers(overs: number, balls: number): string {
  return `${overs}.${balls}`
}

export function calculateRunRate(runs: number, overs: number, balls: number): number {
  const totalOvers = overs + balls / 6
  if (totalOvers === 0) return 0
  return runs / totalOvers
}

export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  totalOvers: number,
  currentOvers: number,
  currentBalls: number
): number {
  const runsNeeded = target - currentRuns
  const oversRemaining = totalOvers - currentOvers - currentBalls / 6
  if (oversRemaining <= 0) return 0
  return runsNeeded / oversRemaining
}

export function calculateNRR(
  runsScored: number,
  oversFaced: number,
  runsConceded: number,
  oversBowled: number
): number {
  if (oversFaced === 0 || oversBowled === 0) return 0
  return runsScored / oversFaced - runsConceded / oversBowled
}

export function generateShareToken(): string {
  // crypto.randomUUID is available in Node 18+ and all modern browsers
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
}

export function getBallColor(ball: {
  runs: number
  is_wicket: boolean
  extra_type?: string
}): string {
  if (ball.is_wicket) return 'bg-crimson-500 text-white'
  if (ball.extra_type === 'wide' || ball.extra_type === 'no_ball') return 'bg-amber-500 text-black'
  if (ball.runs === 6) return 'bg-pitch-500 text-white'
  if (ball.runs === 4) return 'bg-pitch-600 text-white'
  if (ball.runs === 0) return 'bg-arena-muted text-gray-400'
  return 'bg-gray-700 text-white'
}

export function getBallLabel(ball: {
  runs: number
  is_wicket: boolean
  extra_type?: string
  extras: number
}): string {
  if (ball.is_wicket) return 'W'
  if (ball.extra_type === 'wide') return `Wd+${ball.extras}`
  if (ball.extra_type === 'no_ball') return `Nb+${ball.runs}`
  return ball.runs.toString()
}

export function formatMatchStatus(status: string): string {
  const map: Record<string, string> = {
    scheduled: 'Upcoming',
    toss: 'Toss',
    live: 'Live',
    innings_break: 'Innings Break',
    completed: 'Completed',
  }
  return map[status] || status
}

export function getWicketDescription(
  wicketType: string,
  fielder?: string,
  bowler?: string
): string {
  switch (wicketType) {
    case 'bowled': return `b ${bowler || 'Bowler'}`
    case 'caught': return `c ${fielder || 'Fielder'} b ${bowler || 'Bowler'}`
    case 'lbw': return `lbw b ${bowler || 'Bowler'}`
    case 'run_out': return `run out (${fielder || 'Fielder'})`
    case 'stumped': return `st ${fielder || 'WK'} b ${bowler || 'Bowler'}`
    case 'hit_wicket': return `hit wicket b ${bowler || 'Bowler'}`
    default: return 'Out'
  }
}

export function strikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0
  return (runs / balls) * 100
}

export function economy(runs: number, overs: number, balls: number): number {
  const totalOvers = overs + balls / 6
  if (totalOvers === 0) return 0
  return runs / totalOvers
}
