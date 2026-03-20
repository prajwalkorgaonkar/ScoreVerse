'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Trophy, Trash2, Calendar, Loader2, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { tournamentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  tournaments: any[]
  role: 'admin' | 'manager'
}

export default function TournamentsList({ tournaments: init, role }: Props) {
  const [tournaments, setTournaments] = useState(init)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const base = role === 'admin' ? '/dashboard/admin' : '/dashboard/manager'

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tournament? This will also delete all related matches.')) return
    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('tournaments').delete().eq('id', id)
      if (error) throw error
      setTournaments(prev => prev.filter(t => t.id !== id))
      toast.success('Tournament deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePromote = async (id: string, current: boolean) => {
    if (!confirm(current ? 'Remove this tournament and all its inner matches from the global Homepage?' : 'Broadcast this tournament and ALL its matches securely to the global network?')) return
    setPromotingId(id)
    try {
      const { error } = await tournamentsApi.update(id, { is_promoted: !current })
      if (error) throw new Error(error)
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, is_promoted: !current } : t))
      toast.success(current ? 'Offline from Home Page' : 'Broadcasted Live seamlessly!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update broadcast status')
    } finally {
      setPromotingId(null)
    }
  }

  const statusColor = (status: string) => ({
    active: 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20',
    upcoming: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    completed: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  }[status] || '')

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white tracking-wide">
            TOURNAMENTS <span className="gradient-text"></span>
          </h1>
          <p className="text-gray-500 mt-1">{tournaments.length} total</p>
        </div>
        <Link
          href={`${base}/tournaments/new`}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={16} />
          New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="glass-card rounded-3xl py-24 text-center border-dashed border-2 border-arena-border relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 shadow-glow-green/20 border border-amber-500/20">
            <Trophy size={48} className="text-amber-400" />
          </div>
          <h3 className="text-2xl font-display text-white mb-2">No Tournaments Hosted</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            You haven't initialized any global tournament arrays. Assemble teams and orchestrate full-scale fixtures natively from here.
          </p>
          <Link
            href={`${base}/tournaments/new`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all shadow-glow-green hover:scale-105"
          >
            <Plus size={20} />
            Construct First Tournament
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5 hover:border-amber-600/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white text-lg">{t.name}</h3>
                    <span className={cn('text-xs px-2.5 py-0.5 rounded-full border font-medium', statusColor(t.status))}>
                      {t.status}
                    </span>
                    <span className="text-xs text-gray-600 border border-arena-border px-2 py-0.5 rounded">
                      {t.format}
                    </span>
                  </div>
                  {t.description && <p className="text-gray-500 text-sm mb-2">{t.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(t.start_date).toLocaleDateString()}
                      {t.end_date && ` — ${new Date(t.end_date).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`${base}/tournaments/${t.id}`}
                    className="px-4 py-2 bg-arena-dark border border-arena-border hover:border-amber-600/50 text-white text-sm rounded-lg transition-colors"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => handlePromote(t.id, t.is_promoted)}
                    disabled={promotingId === t.id}
                    title={t.is_promoted ? "Unpublish Match Hub" : "Broadcast Match Hub"}
                    className={`p-2 rounded-lg transition-colors ${
                      t.is_promoted ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'text-gray-600 hover:text-white hover:bg-white/10'
                    } ${promotingId === t.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Globe size={18} />
                  </button>
                  {role === 'admin' && (
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      className="p-2 text-gray-600 hover:text-crimson-400 hover:bg-crimson-500/10 rounded-lg transition-colors"
                    >
                      {deletingId === t.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
