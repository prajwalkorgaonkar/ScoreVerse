import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-arena-muted rounded-lg', className)} />
  )
}

export function MatchCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-24 h-4" />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-24 h-4" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="w-12 h-4 ml-auto" />
          <Skeleton className="w-20 h-8 ml-auto" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-arena-border">
        <Skeleton className="w-32 h-5" />
      </div>
      <div className="divide-y divide-arena-border/50">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <Skeleton className="w-16 h-8" />
      <Skeleton className="w-20 h-3" />
    </div>
  )
}

export function ScoreboardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="w-12 h-4" />
      </div>
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="w-28 h-5" />
          <Skeleton className="w-36 h-14" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="w-16 h-4 ml-auto" />
          <Skeleton className="w-24 h-10 ml-auto" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export function PlayerRowSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-arena-border/50">
          <Skeleton className="w-6 h-4" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-10 h-6 ml-auto" />
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-8 h-4" />
          <Skeleton className="w-12 h-4" />
        </div>
      ))}
    </>
  )
}
