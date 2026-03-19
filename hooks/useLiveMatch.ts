'use client'

import { useState, useCallback } from 'react'
import { useMatchRealtime } from './useMatchRealtime'
import { scoringApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface UseLiveMatchOptions {
  match: any
  initialInnings: any
  initialBalls: any[]
}

/**
 * Central state machine for the live scoring interface.
 * Merges API calls with Realtime updates for optimistic UI.
 */
export function useLiveMatch({ match, initialInnings, initialBalls }: UseLiveMatchOptions) {
  const [innings, setInnings]           = useState(initialInnings)
  const [balls, setBalls]               = useState<any[]>(initialBalls)
  const [lastBall, setLastBall]         = useState<any>(null)
  const [submitting, setSubmitting]     = useState(false)
  const [undoing, setUndoing]           = useState(false)
  const [nextState, setNextState]       = useState<'continuing' | 'innings_break' | 'match_end'>('continuing')
  const [matchResult, setMatchResult]   = useState<any>(null)
  const [newInnings, setNewInnings]     = useState<any>(null)

  // Subscribe to realtime changes
  useMatchRealtime({
    matchId: match.id,
    inningsId: innings?.id,
    onEvent: (event) => {
      if (event.type === 'ball_added') {
        setBalls(prev => {
          // Avoid duplicates from optimistic update
          if (prev.find(b => b.id === event.payload.id)) return prev
          return [event.payload, ...prev].slice(0, 60)
        })
      }
      if (event.type === 'innings_update') {
        setInnings((prev: any) => prev?.id === event.payload.id ? event.payload : prev)
      }
    },
  })

  const recordBall = useCallback(async (ballData: {
    batsman_id: string
    bowler_id: string
    runs: number
    extras: number
    extra_type: string | null
    is_wicket: boolean
    wicket_type: string | null
    fielder_id: string | null
    commentary?: string
  }) => {
    if (!innings?.id) return toast.error('No active innings')

    setSubmitting(true)
    try {
      const { data, error } = await scoringApi.recordBall(match.id, {
        innings_id: innings.id,
        ...ballData,
      })
      if (error) { toast.error(error); return }
      if (!data)  { toast.error('No response from server'); return }

      // Optimistic update
      setBalls(prev => [data.ball, ...prev].slice(0, 60))
      setInnings(data.innings)
      setLastBall(data.ball)
      setNextState(data.next_state)

      if (data.over_completed) toast.success(`Over ${innings.total_overs + 1} complete!`)

      if (data.next_state === 'innings_break') {
        setNewInnings(data.new_innings)
        toast.success(`Innings over! Target: ${data.innings.total_runs + 1}`)
      }

      if (data.next_state === 'match_end' && data.match_result) {
        setMatchResult(data.match_result)
        toast.success('Match completed! 🏆')
      }

      return data
    } finally {
      setSubmitting(false)
    }
  }, [match.id, innings])

  const undoLastBall = useCallback(async () => {
    if (!innings?.id) return
    setUndoing(true)
    try {
      const { data, error } = await scoringApi.undoBall(match.id, innings.id)
      if (error) { toast.error(error); return }
      if (!data)  { toast.error('Failed to undo'); return }

      // Remove last ball from local list
      setBalls(prev => prev.filter(b => b.id !== data.removed_ball.id))
      setInnings(data.innings)
      setLastBall(null)
      setNextState('continuing')
      toast.success('Last ball undone')
    } finally {
      setUndoing(false)
    }
  }, [match.id, innings])

  const switchToInnings2 = useCallback(() => {
    if (newInnings) {
      setInnings(newInnings)
      setBalls([])
      setNewInnings(null)
      setNextState('continuing')
    }
  }, [newInnings])

  const currentOverBalls = balls
    .filter(b => b.over_number === innings?.total_overs)
    .slice(0, 6)
    .reverse()

  return {
    innings,
    balls,
    lastBall,
    submitting,
    undoing,
    nextState,
    matchResult,
    newInnings,
    currentOverBalls,
    recordBall,
    undoLastBall,
    switchToInnings2,
  }
}
