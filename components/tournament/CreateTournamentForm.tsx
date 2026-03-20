'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Calendar, MapPin, User, Mail, Phone, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function CreateTournamentForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    start_date: '',
    end_date: '',
    city: '',
    ground_name: '',
    organizer_name: '',
    contact_email: '',
    contact_phone: '',
    visibility: 'public'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...formData,
          created_by: userId,
          status: 'upcoming'
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Tournament created successfully!')
      router.push(`/dashboard/manager/tournaments/${data.id}`)
      router.refresh()

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="glass-card rounded-2xl overflow-hidden border border-arena-border">
        {/* Header */}
        <div className="bg-arena-dark/50 p-6 border-b border-arena-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-700 flex items-center justify-center shadow-glow-green">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-display text-white font-bold tracking-wide">Create New Tournament</h1>
            <p className="text-gray-400 text-sm mt-1">Set up the fundamental details for your upcoming competition</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Section: Basic Details */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-pitch-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Trophy size={16} /> Basic Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">Tournament Name <span className="text-crimson-500">*</span></label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Summer Championship 2026" className="input-arena w-full" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Short Name</label>
                <input type="text" name="short_name" value={formData.short_name} onChange={handleChange} placeholder="e.g. SC26" className="input-arena w-full" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Visibility</label>
                <select name="visibility" value={formData.visibility} onChange={handleChange} className="input-arena w-full">
                  <option value="public">Public (Visible to everyone)</option>
                  <option value="private">Private (Invite only)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section: Schedule & Location */}
          <section className="space-y-4 pt-6 border-t border-arena-border/50">
            <h2 className="text-sm font-bold text-pitch-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MapPin size={16} /> Schedule & Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input-arena w-full pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input-arena w-full pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" className="input-arena w-full pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ground Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="ground_name" value={formData.ground_name} onChange={handleChange} placeholder="e.g. Central Stadium" className="input-arena w-full pl-10" />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Organizers */}
          <section className="space-y-4 pt-6 border-t border-arena-border/50">
            <h2 className="text-sm font-bold text-pitch-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <User size={16} /> Organizer Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-300">Organizer Name / Organization</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="organizer_name" value={formData.organizer_name} onChange={handleChange} placeholder="Who is hosting this?" className="input-arena w-full pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} placeholder="support@example.com" className="input-arena w-full pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="+1 234 567 890" className="input-arena w-full pl-10" />
                </div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-8 mt-2 border-t border-arena-border/50 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-premium px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />}
              {loading ? 'Creating...' : 'Launch Tournament'}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  )
}
