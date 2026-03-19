'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Calendar, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NewTournamentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    format: 'T20',
    status: 'upcoming',
    start_date: '',
    end_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.start_date) return toast.error('Name and start date are required')

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('tournaments').insert({
        ...form,
        end_date: form.end_date || null,
        created_by: user?.id,
      }).select().single()
      if (error) throw error
      toast.success('Tournament created!')
      router.push(`/dashboard/admin/tournaments/${data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-display text-white tracking-wide">NEW <span className="gradient-text-gold">TOURNAMENT</span></h1>
        <p className="text-gray-500 mt-1">Set up a new cricket tournament</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tournament Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-arena"
              placeholder="e.g. Premier Cricket League 2024"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-arena resize-none"
              rows={3}
              placeholder="Brief description of the tournament..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Format</label>
              <select
                value={form.format}
                onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                className="input-arena"
              >
                {['T20', 'ODI', 'Test', 'Custom'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="input-arena"
              >
                {['upcoming', 'active', 'completed'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Calendar size={13} className="inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="input-arena"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Calendar size={13} className="inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="input-arena"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />}
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
