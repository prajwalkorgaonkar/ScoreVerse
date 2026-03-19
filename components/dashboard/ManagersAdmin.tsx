'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCog, Shield, CircleDot, Trash2, RefreshCw, Loader2, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  managers: any[]
  currentUserId: string
}

export default function ManagersAdmin({ managers: init, currentUserId }: Props) {
  const [managers, setManagers] = useState(init)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const toggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUserId) return toast.error("Can't change your own role")
    const newRole = currentRole === 'super_admin' ? 'manager' : 'super_admin'
    if (!confirm(`Change this user to ${newRole}?`)) return

    setUpdatingId(userId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
      if (error) throw error
      setManagers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m))
      toast.success(`Role updated to ${newRole}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (userId === currentUserId) return toast.error("Can't delete yourself")
    if (!confirm('Delete this user? This cannot be undone.')) return

    setDeletingId(userId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').delete().eq('id', userId)
      if (error) throw error
      setManagers(prev => prev.filter(m => m.id !== userId))
      toast.success('User deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const admins = managers.filter(m => m.role === 'super_admin')
  const regularManagers = managers.filter(m => m.role === 'manager')

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display text-white tracking-wide">USER <span className="gradient-text-gold">MANAGEMENT</span></h1>
        <p className="text-gray-500 mt-1">{managers.length} total users — God Mode control</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Super Admins</span>
          </div>
          <div className="text-3xl font-display text-white">{admins.length}</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-pitch-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CircleDot size={16} className="text-pitch-400" />
            <span className="text-pitch-400 text-sm font-medium">Managers</span>
          </div>
          <div className="text-3xl font-display text-white">{regularManagers.length}</div>
        </div>
      </div>

      {/* Users table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-arena-border flex items-center gap-2">
          <UserCog size={16} className="text-gray-400" />
          <span className="font-semibold text-white">All Users</span>
        </div>
        <div className="divide-y divide-arena-border/50">
          {managers.map((manager, i) => (
            <motion.div
              key={manager.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                  manager.role === 'super_admin'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-pitch-500/20 border border-pitch-500/40 text-pitch-400'
                )}>
                  {manager.full_name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{manager.full_name}</span>
                    {manager.id === currentUserId && (
                      <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">You</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{manager.email}</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Joined {new Date(manager.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Role badge */}
                <span className={cn(
                  'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium',
                  manager.role === 'super_admin'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20'
                )}>
                  {manager.role === 'super_admin' ? <Shield size={11} /> : <CircleDot size={11} />}
                  {manager.role === 'super_admin' ? 'Super Admin' : 'Manager'}
                </span>

                {/* Actions — only for other users */}
                {manager.id !== currentUserId && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleRole(manager.id, manager.role)}
                      disabled={!!updatingId}
                      title={`Switch to ${manager.role === 'super_admin' ? 'Manager' : 'Super Admin'}`}
                      className="p-2 text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                      {updatingId === manager.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Crown size={14} />}
                    </button>
                    <button
                      onClick={() => deleteUser(manager.id)}
                      disabled={!!deletingId}
                      title="Delete user"
                      className="p-2 text-gray-600 hover:text-crimson-400 hover:bg-crimson-500/10 rounded-lg transition-colors"
                    >
                      {deletingId === manager.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-white mb-1">God Mode Active</div>
            <div className="text-xs text-gray-500 leading-relaxed">
              As Super Admin, you can promote or demote any user's role and delete accounts.
              New users who register via the sign-up page are automatically assigned the Manager role.
              To create a new Super Admin, they must first register and then be promoted here.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
