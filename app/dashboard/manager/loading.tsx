import { Plus, Swords, Trophy, Clock } from 'lucide-react'

export default function ManagerLoading() {
  return (
    <div className="space-y-8 max-w-5xl animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-64 bg-white/5 rounded-lg mb-2" />
          <div className="h-5 w-48 bg-white/5 rounded-lg" />
        </div>
        <div className="px-5 py-2.5 bg-white/5 rounded-xl w-32 h-10" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card rounded-xl p-6 border border-white/5">
            <div className="w-10 h-10 bg-white/5 rounded-lg mb-3" />
            <div className="h-10 w-16 bg-white/10 rounded-lg mb-2" />
            <div className="h-4 w-24 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Recent Matches Skeleton */}
      <div className="glass-card rounded-xl overflow-hidden border border-white/5">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-600" />
            <div className="h-5 w-32 bg-white/5 rounded-lg" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="h-5 w-48 bg-white/5 rounded-lg" />
              <div className="h-5 w-12 bg-white/5 rounded-lg" />
              <div className="h-6 w-20 bg-white/5 rounded-full" />
              <div className="h-5 w-24 bg-white/5 rounded-lg" />
              <div className="h-5 w-16 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
