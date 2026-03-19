'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Loader2, Check, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function EditTournamentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    name: '', description: '', format: 'T20', status: 'upcoming', start_date: '', end_date: '',
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('tournaments').select('*').eq('id', id).single()
      if (data) {
        setForm({
          name: data.name,
          description: data.description || '',
          format: data.format,
          status: data.status,
          start_date: data.start_date,
          end_date: data.end_date || '',
        })
      }
      setFetching(false)
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, end_date: form.end_date || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Tournament updated!')
      router.push(`/dashboard/admin/tournaments/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-pitch-400" />
    </div>
  )

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href={`/dashboard/admin/tournaments/${id}`} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-3 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-3xl font-display text-white tracking-wide">EDIT <span className="gradient-text-gold">TOURNAMENT</span></h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tournament Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-arena" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-arena resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Format</label>
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} className="input-arena">
                {['T20','ODI','Test','Custom'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-arena">
                {['upcoming','active','completed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Start Date *</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="input-arena" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="input-arena" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
