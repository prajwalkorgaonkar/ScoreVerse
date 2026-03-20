import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import PublicTournamentCard from '@/components/shared/PublicTournamentCard'
import PublicMatchSearch from '@/components/shared/PublicMatchSearch'
import PublicMatchList from '@/components/shared/PublicMatchList'
import { Activity, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function ScoresHubPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : '';

  const supabase = createClient()
  
  const { data: rawMatches } = await supabase
    .from('matches')
    .select(`
      id, status, total_overs, players_per_team, venue, current_innings,
      share_token, created_at, toss_winner_id, toss_choice,
      batting_team_id, bowling_team_id,
      winner_team_id, win_by_runs, win_by_wickets, is_tie,
      team1:teams!matches_team1_id_fkey(id, name, short_name, color),
      team2:teams!matches_team2_id_fkey(id, name, short_name, color),
      tournament:tournaments(id, name, format),
      innings(id, innings_number, total_runs, total_wickets, total_overs, total_balls, is_completed, target)
    `)
    .in('status', ['live', 'innings_break', 'completed'])
    .eq('is_promoted', true)
    .order('updated_at', { ascending: false })
    .limit(50)

  const allMatches = (rawMatches || []).slice(0, 30)
  
  const filteredMatches = allMatches.filter(m => {
    if (!q) return true;
    
    const getField = (entity: any, field: string) => Array.isArray(entity) ? entity[0]?.[field] : entity?.[field];

    const t1 = (getField(m.team1, 'name') || '').toLowerCase();
    const t2 = (getField(m.team2, 'name') || '').toLowerCase();
    const t1s = (getField(m.team1, 'short_name') || '').toLowerCase();
    const t2s = (getField(m.team2, 'short_name') || '').toLowerCase();
    const tour = (getField(m.tournament, 'name') || '').toLowerCase();
    
    return t1.includes(q) || t2.includes(q) || t1s.includes(q) || t2s.includes(q) || tour.includes(q);
  })

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      id, name, format, start_date, end_date, description,
      teams(count)
    `)
    .eq('is_promoted', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="bg-arena-dark min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
      <div className="fixed inset-0 bg-green-glow pointer-events-none opacity-40" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-pitch-600/10 border border-pitch-600/30 rounded-full text-pitch-400 font-bold tracking-wide uppercase mb-4 sm:mb-6 shadow-glow-green text-xs sm:text-sm">
            <Activity size={16} className="animate-pulse" />
            Global Match Hub
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display text-white mb-4 tracking-wide">
            LIVE <span className="gradient-text">SCORES</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-lg pt-2">
            Real-time ball-by-ball updates and historical scorecards from tournaments running around the world.
          </p>
        </div>

        <Suspense fallback={<div className="h-14 mb-12 max-w-2xl mx-auto rounded-2xl bg-arena-card/60 animate-pulse" />}>
          <PublicMatchSearch />
        </Suspense>

        {/* Real-time Match List (Live + Completed) */}
        <PublicMatchList initialMatches={filteredMatches} />

        {/* Featured Tournaments Section */}
        {tournaments && tournaments.length > 0 && (
          <div className="my-16">
            <div className="flex items-center gap-3 mb-8">
              <Trophy size={24} className="text-amber-400" />
              <h2 className="text-2xl font-display text-white">Featured Tournaments</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map(tournament => (
                <PublicTournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
