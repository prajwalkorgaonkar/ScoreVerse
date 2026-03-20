'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type RealtimeMatchEvent =
  | { type: 'ball_added';     payload: any }
  | { type: 'innings_update'; payload: any }
  | { type: 'match_update';   payload: any }

interface Options {
  matchId: string
  inningsId?: string
  onEvent: (event: RealtimeMatchEvent) => void
}

/**
 * Subscribes to live Supabase Realtime changes for a match.
 * Automatically cleans up on unmount.
 */
export function useMatchRealtime({ matchId, inningsId, onEvent }: Options) {
  const supabase = createClient()
  const channelRef = useRef<any>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent   // always call latest version

  useEffect(() => {
    const channelName = `match-realtime-${matchId}`
    const channel = supabase.channel(channelName)

    // Ball deliveries — filter by innings if provided
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'balls',
        ...(inningsId ? { filter: `innings_id=eq.${inningsId}` } : {}),
      },
      (payload) => onEventRef.current({ type: 'ball_added', payload: payload.new })
    )

    // Innings score updates (both new innings and updates)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'innings',
        filter: `match_id=eq.${matchId}`,
      },
      (payload: any) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          onEventRef.current({ type: 'innings_update', payload: payload.new })
        }
      }
    )

    // Match status changes
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      },
      (payload) => onEventRef.current({ type: 'match_update', payload: payload.new })
    )

    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, inningsId])
}
