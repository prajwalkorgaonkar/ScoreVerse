import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import PublicMatchCard from '@/components/shared/PublicMatchCard'
import PublicTournamentCard from '@/components/shared/PublicTournamentCard'
import PublicMatchSearch from '@/components/shared/PublicMatchSearch'
import { Activity, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function ScoresHubPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : '';

  const supabase = createClient()
  
  const { data: rawMatches, error } = await supabase
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
    
    // Supabase TS types sometimes infer these as arrays depending on the schema introspection
    const getField = (entity: any, field: string) => Array.isArray(entity) ? entity[0]?.[field] : entity?.[field];

    const t1 = (getField(m.team1, 'name') || '').toLowerCase();
    const t2 = (getField(m.team2, 'name') || '').toLowerCase();
    const t1s = (getField(m.team1, 'short_name') || '').toLowerCase();
    const t2s = (getField(m.team2, 'short_name') || '').toLowerCase();
    const tour = (getField(m.tournament, 'name') || '').toLowerCase();
    
    return t1.includes(q) || t2.includes(q) || t1s.includes(q) || t2s.includes(q) || tour.includes(q);
  })

  const liveMatches = filteredMatches.filter(m => m.status === 'live' || m.status === 'innings_break')
  const completedMatches = filteredMatches.filter(m => m.status === 'completed')

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
    <div className="bg-arena-dark min-h-screen pt-32 pb-20 px-6">
      <div className="fixed inset-0 bg-green-glow pointer-events-none opacity-40" />
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-pitch-600/10 border border-pitch-600/30 rounded-full text-pitch-400 font-bold tracking-wide uppercase mb-6 shadow-glow-green">
            <Activity size={18} className="animate-pulse" />
            Global Match Hub
          </div>
          <h1 className="text-5xl md:text-7xl font-display text-white mb-4 tracking-wide">
            LIVE <span className="gradient-text">SCORES</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg pt-2">
            Real-time ball-by-ball updates and historical scorecards from tournaments running around the world.
          </p>
        </div>

        <Suspense fallback={<div className="h-14 mb-12 max-w-2xl mx-auto rounded-2xl bg-arena-card/60 animate-pulse" />}>
          <PublicMatchSearch />
        </Suspense>

        {/* Live Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="live-dot" />
            <h2 className="text-2xl font-display text-white">Live Matches</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-crimson-500/20 text-crimson-400 text-xs font-bold font-mono">
              {liveMatches.length}
            </span>
          </div>
          
          {liveMatches.length === 0 ? (
            <div className="border border-arena-border border-dashed rounded-3xl p-12 text-center text-gray-500 bg-arena-card/30">
              <Activity size={32} className="mx-auto mb-4 opacity-50" />
              <p>No live matches currently in progress. Check back shortly!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.map(match => (
                <PublicMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>

        {/* Featured Tournaments Section */}
        {tournaments && tournaments.length > 0 && (
          <div className="mb-16">
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

        {/* Completed Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Trophy size={24} className="text-pitch-500" />
            <h2 className="text-2xl font-display text-white">Recent Results</h2>
          </div>
          
          {completedMatches.length === 0 ? (
            <div className="border border-arena-border border-dashed rounded-3xl p-12 text-center text-gray-500 bg-arena-card/30">
              <Trophy size={32} className="mx-auto mb-4 opacity-50" />
              <p>No completed matches logged yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedMatches.map(match => (
                <PublicMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
