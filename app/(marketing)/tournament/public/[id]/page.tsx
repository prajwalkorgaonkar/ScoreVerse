import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Calendar, Users, Swords, Crosshair } from 'lucide-react'
import PublicNavbar from '@/components/shared/PublicNavbar'
import PublicMatchCard from '@/components/shared/PublicMatchCard'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function TournamentHubPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient()
  const { id } = await params

  // Fetch Tournament and its Teams strictly mapped to approved creators
  const { data: tournament } = await supabase
    .from('tournaments')
    .select(`
      *,
      creator:profiles(id, is_approved),
      teams(id, name, short_name, color, players(id))
    `)
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  // Fetch all matches for the tournament identically
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name, short_name, color),
      team2:teams!matches_team2_id_fkey(id, name, short_name, color),
      tournament:tournaments(name, format),
      innings(id, innings_number, total_runs, total_wickets, total_overs, total_balls, is_completed, target)
    `)
    .eq('tournament_id', id)
    .order('created_at', { ascending: false })

  // Mathematical Points Table Algorithm
  const standings: Record<string, any> = {}
  tournament.teams.forEach((t: any) => {
    standings[t.id] = { 
      id: t.id, name: t.name, short_name: t.short_name, color: t.color, 
      pld: 0, won: 0, lost: 0, tied: 0, pts: 0,
      runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0, nrr: 0, form: []
    }
  })

  // Parse results
  matches?.forEach((m: any) => {
    if (m.status !== 'completed' || !m.team1_id || !m.team2_id) return
    
    // Safety check just in case deleted teams
    if (!standings[m.team1_id]) standings[m.team1_id] = { id: m.team1_id, name: m.team1?.short_name || 'T1', short_name: m.team1?.short_name || 'T1', color: m.team1?.color, pld: 0, won: 0, lost: 0, tied: 0, pts: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0, nrr: 0, form: [] }
    if (!standings[m.team2_id]) standings[m.team2_id] = { id: m.team2_id, name: m.team2?.short_name || 'T2', short_name: m.team2?.short_name || 'T2', color: m.team2?.color, pld: 0, won: 0, lost: 0, tied: 0, pts: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0, nrr: 0, form: [] }

    standings[m.team1_id].pld++
    standings[m.team2_id].pld++

    if (m.is_tie) {
      standings[m.team1_id].tied++
      standings[m.team2_id].tied++
      standings[m.team1_id].pts += 1
      standings[m.team2_id].pts += 1
    } else if (m.winner_team_id === m.team1_id) {
      standings[m.team1_id].won++
      standings[m.team2_id].lost++
      standings[m.team1_id].pts += 2
    } else if (m.winner_team_id === m.team2_id) {
      standings[m.team2_id].won++
      standings[m.team1_id].lost++
      standings[m.team2_id].pts += 2
    }

    // NRR Calculation bounds
    const tossWinnerBatting = m.toss_choice === 'bat'
    const team1BattingFirst = (m.toss_winner_id === m.team1_id && tossWinnerBatting) || (m.toss_winner_id === m.team2_id && !tossWinnerBatting)

    const firstInningsId = team1BattingFirst ? m.team1_id : m.team2_id
    const secondInningsId = team1BattingFirst ? m.team2_id : m.team1_id

    const inn1 = m.innings?.find((i: any) => i.innings_number === 1)
    const inn2 = m.innings?.find((i: any) => i.innings_number === 2)

    const matchQuota = m.total_overs || 20 
    const isAllOut = (inn: any) => inn.total_wickets >= (m.players_per_team ? m.players_per_team - 1 : 10)

    const getOversForNRR = (inn: any) => {
      if (isAllOut(inn)) return matchQuota
      return inn.total_overs + (inn.total_balls / 6.0)
    }

    if (inn1) {
      const oversBat = getOversForNRR(inn1)
      const runs = inn1.total_runs || 0
      standings[firstInningsId].runsFor += runs
      standings[firstInningsId].oversFor += oversBat
      standings[secondInningsId].runsAgainst += runs
      standings[secondInningsId].oversAgainst += oversBat
    }

    if (inn2) {
      const oversBat = getOversForNRR(inn2)
      const runs = inn2.total_runs || 0
      standings[secondInningsId].runsFor += runs
      standings[secondInningsId].oversFor += oversBat
      standings[firstInningsId].runsAgainst += runs
      standings[firstInningsId].oversAgainst += oversBat
    }
  })

  // Final NRR & Form execution
  Object.values(standings).forEach((team: any) => {
    const rfRate = team.oversFor > 0 ? (team.runsFor / team.oversFor) : 0
    const raRate = team.oversAgainst > 0 ? (team.runsAgainst / team.oversAgainst) : 0
    team.nrr = rfRate - raRate

    // Chronological Form Guide extraction
    const teamCompletedMatches = matches
      .filter((m: any) => m.status === 'completed' && (m.team1_id === team.id || m.team2_id === team.id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    team.form = teamCompletedMatches.slice(0, 3).map((m: any) => {
      if (m.is_tie) return 'T'
      return m.winner_team_id === team.id ? 'W' : 'L'
    })
  })

  const pointsTable = Object.values(standings).sort((a: any, b: any) => {
    if (b.pts !== a.pts) return b.pts - a.pts // Sort by Points
    if (b.won !== a.won) return b.won - a.won // Tie breaker: Wins
    return b.nrr - a.nrr // Final Tie breaker: NRR
  })

  return (
    <div className="min-h-screen bg-arena-dark">
      <PublicNavbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Hub Header */}
        <div className="glass-card rounded-3xl p-8 mb-8 border border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider">
                <Trophy size={14} />
                TOURNAMENT HUB
              </div>
              <h1 className="text-3xl md:text-5xl font-display text-white">{tournament.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Crosshair size={14} className="text-pitch-400" /> {tournament.format} Format</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-pitch-400" /> {new Date(tournament.start_date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Users size={14} className="text-pitch-400" /> {tournament.teams.length} Teams</span>
              </div>
              {tournament.description && (
                <p className="text-gray-300 leading-relaxed mt-4 whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5">
                  {tournament.description}
                </p>
              )}
            </div>
            
            <div className="glass-card rounded-2xl p-6 w-full md:w-64 text-center shrink-0 border-amber-500/10">
              <h3 className="text-4xl font-display text-amber-400">{matches?.length || 0}</h3>
              <p className="text-gray-500 text-sm font-medium mt-1">Total Matches</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Matches Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display text-white">Tournament <span className="gradient-text">Matches</span></h2>
            </div>
            {matches && matches.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {matches.map((match: any) => (
                  <PublicMatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center text-gray-500 border border-dashed border-arena-border">
                <Swords size={32} className="mx-auto mb-3 opacity-50" />
                <p>No matches scheduled yet for this tournament.</p>
              </div>
            )}
          </div>

          {/* Points Table Sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-display text-white">Points <span className="gradient-text-gold">Table</span></h2>
            
            <div className="glass-card rounded-2xl overflow-hidden border border-arena-border/50">
              <div className="overflow-x-auto">
                <table className="arena-table w-full whitespace-nowrap text-sm">
                  <thead>
                    <tr className="bg-arena-dark/50">
                      <th className="pl-5 text-left text-xs text-gray-400 uppercase tracking-widest py-4">Team</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest w-12" title="Played">P</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest w-12" title="Won">W</th>
                      <th className="text-center text-xs text-gray-400 uppercase tracking-widest w-12" title="Lost">L</th>
                      <th className="hidden sm:table-cell text-center text-xs text-gray-400 uppercase tracking-widest w-24">Form</th>
                      <th className="hidden xs:table-cell text-center text-xs text-gray-400 uppercase tracking-widest w-16" title="Net Run Rate">NRR</th>
                      <th className="text-center text-xs text-amber-400 uppercase tracking-widest w-12 font-bold" title="Points">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointsTable.map((team, idx) => (
                      <tr key={team.id} className="border-t border-arena-border/30 hover:bg-white/5 transition-colors">
                        <td className="pl-5 py-3 flex items-center gap-3">
                          <span className="text-gray-500 text-xs w-3">{idx + 1}</span>
                          <div className="w-5 h-5 rounded flex-shrink-0" style={{ backgroundColor: team.color }} />
                          <span className="font-medium text-white">{team.short_name}</span>
                        </td>
                        <td className="text-center py-3 text-gray-400">{team.pld}</td>
                        <td className="text-center py-3 text-pitch-400">{team.won}</td>
                        <td className="text-center py-3 text-crimson-400">{team.lost}</td>
                         <td className="hidden sm:table-cell text-center py-3">
                           <div className="flex items-center justify-center gap-1.5">
                             {team.form.map((res: string, fIdx: number) => (
                               <span key={fIdx} className={cn('w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold', {
                                 'bg-pitch-500/20 text-pitch-400': res === 'W',
                                 'bg-crimson-500/20 text-crimson-400': res === 'L',
                                 'bg-amber-500/20 text-amber-400': res === 'T',
                               })}>
                                 {res}
                               </span>
                             ))}
                             {team.form.length === 0 && <span className="text-gray-600 text-xs">-</span>}
                           </div>
                         </td>
                         <td className={cn('hidden xs:table-cell text-center py-3 font-mono text-xs', team.nrr >= 0 ? 'text-pitch-400' : 'text-crimson-400')}>
                           {team.nrr >= 0 ? '+' : ''}{team.nrr.toFixed(3)}
                         </td>
                        <td className="text-center py-3 text-amber-400 font-bold text-base bg-amber-500/5">{team.pts}</td>
                      </tr>
                    ))}
                    {pointsTable.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-6 text-gray-500 italic">No teams registered</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}
