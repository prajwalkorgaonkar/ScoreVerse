import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// POST /api/matches/[id]/toss
// Body: { toss_winner_id, toss_choice: 'bat' | 'bowl' }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { toss_winner_id, toss_choice } = await req.json()

    if (!toss_winner_id)          return err('toss_winner_id is required')
    if (!['bat','bowl'].includes(toss_choice)) return err('toss_choice must be bat or bowl')

    const supabase = createClient()

    // Fetch match to validate
    const { data: match } = await supabase
      .from('matches')
      .select('id, status, team1_id, team2_id, created_by')
      .eq('id', resolvedParams.id)
      .single()

    if (!match) return err('Match not found', 404)
    if (!['scheduled', 'toss'].includes(match.status)) return err('Toss already done or match not in valid state')
    if (match.team1_id !== toss_winner_id && match.team2_id !== toss_winner_id) {
      return err('toss_winner_id must be one of the match teams')
    }

    // Check ownership
    if (user.role !== 'super_admin' && match.created_by !== user.id) {
      return err('Forbidden', 403)
    }

    const { data, error } = await supabase
      .from('matches')
      .update({ toss_winner_id, toss_choice, status: 'toss' })
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) return err(error.message, 500)
    return ok({ match: data, message: `Toss recorded — ${toss_choice === 'bat' ? 'will bat' : 'will bowl'} first` })
  } catch (e: any) {
    return err(e.message, 500)
  }
}
