import Link from 'next/link'
import { Trophy, Calendar, Users, Target } from 'lucide-react'

export default function PublicTournamentCard({ tournament }: { tournament: any }) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-arena-border/50 hover:border-amber-500/30 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-display text-white group-hover:text-amber-400 transition-colors">{tournament.name}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{tournament.description || 'Welcome to the Global Match Hub.'}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-arena-dark/50 flex items-center justify-center border border-arena-border shrink-0">
          <Trophy size={16} className="text-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
        <div className="bg-arena-dark/40 rounded-xl p-3 border border-arena-border/50">
          <div className="text-gray-500 text-xs mb-1 flex items-center gap-1.5"><Target size={12} /> Format</div>
          <div className="text-white text-sm font-medium">{tournament.format}</div>
        </div>
        <div className="bg-arena-dark/40 rounded-xl p-3 border border-arena-border/50">
          <div className="text-gray-500 text-xs mb-1 flex items-center gap-1.5"><Users size={12} /> Teams</div>
          <div className="text-white text-sm font-medium">{tournament.teams?.[0]?.count || 0} Registered</div>
        </div>
      </div>

      <Link 
        href={`/tournament/public/${tournament.id}`}
        className="w-full relative z-10 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-amber-500/20 border border-transparent hover:border-amber-500/30 text-amber-100 font-medium rounded-xl transition-all"
      >
        <Trophy size={16} className="text-amber-400" />
        Enter Tournament Hub
      </Link>
    </div>
  )
}
