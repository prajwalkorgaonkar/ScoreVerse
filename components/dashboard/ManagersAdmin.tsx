'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCog, Shield, CircleDot, Trash2, RefreshCw, Loader2, Crown, CheckCircle2, XCircle } from 'lucide-react'
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
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      if (!res.ok) throw new Error(await res.text())
      setManagers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m))
      toast.success(`Role updated to ${newRole}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUserId) return toast.error("Can't change your own approval status")
    const newStatus = !currentStatus
    setUpdatingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: newStatus })
      })
      if (!res.ok) throw new Error(await res.text())
      setManagers(prev => prev.map(m => m.id === userId ? { ...m, is_approved: newStatus } : m))
      toast.success(`Manager ${newStatus ? 'approved' : 'revoked'}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update approval status')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (userId === currentUserId) return toast.error("Can't delete yourself")
    if (!confirm('Delete this user? This cannot be undone.')) return

    setDeletingId(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
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
        <h1 className="text-2xl sm:text-3xl font-display text-white tracking-wide">USER <span className="gradient-text-gold">MANAGEMENT</span></h1>
        <p className="text-gray-500 mt-1 text-sm">{managers.length} total users — God Mode control</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="glass-card rounded-xl p-3 sm:p-4 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-amber-400" />
            <span className="text-amber-400 text-xs sm:text-sm font-medium">Super Admins</span>
          </div>
          <div className="text-2xl sm:text-3xl font-display text-white">{admins.length}</div>
        </div>
        <div className="glass-card rounded-xl p-3 sm:p-4 border border-pitch-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CircleDot size={16} className="text-pitch-400" />
            <span className="text-pitch-400 text-xs sm:text-sm font-medium">Managers</span>
          </div>
          <div className="text-2xl sm:text-3xl font-display text-white">{regularManagers.length}</div>
        </div>
      </div>

      {/* Shared user card renderer */}
      {[
        { title: 'Super Admins', icon: Shield, iconColor: 'text-amber-400', borderColor: 'border-amber-500/20', list: admins },
        { title: 'Managers', icon: CircleDot, iconColor: 'text-pitch-400', borderColor: 'border-pitch-500/20', list: regularManagers },
      ].map(section => (
        <div key={section.title} className={`glass-card rounded-xl overflow-hidden border ${section.borderColor}`}>
          <div className="px-4 sm:px-6 py-4 border-b border-arena-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <section.icon size={16} className={section.iconColor} />
              <span className="font-semibold text-white">{section.title}</span>
            </div>
            <span className="text-xs text-gray-500 bg-arena-dark px-2.5 py-1 rounded-full font-mono">{section.list.length}</span>
          </div>
          {section.list.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-600 text-sm">No {section.title.toLowerCase()} found</div>
          ) : (
            <div className="divide-y divide-arena-border/50">
              {section.list.map((manager: any, i: number) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-4 sm:px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  {/* Top row: Avatar + Info */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={cn(
                      'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                      manager.role === 'super_admin'
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                        : 'bg-pitch-500/20 border border-pitch-500/40 text-pitch-400'
                    )}>
                      {manager.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white text-sm sm:text-base truncate">{manager.full_name}</span>
                        {manager.id === currentUserId && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">You</span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{manager.email}</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                        Joined {new Date(manager.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: Badges + Actions */}
                  <div className="flex items-center justify-between mt-3 ml-12 sm:ml-14">
                    <div className="flex items-center gap-2 flex-wrap">
                      {manager.role === 'manager' && (
                        <span className={cn(
                          'flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border font-medium',
                          manager.is_approved
                            ? 'text-pitch-400 bg-pitch-500/10 border-pitch-500/20'
                            : 'text-crimson-400 bg-crimson-500/10 border-crimson-500/20'
                        )}>
                          {manager.is_approved ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {manager.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      )}
                    </div>

                    {manager.id !== currentUserId && (
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {manager.role === 'manager' && (
                          <button
                            onClick={() => toggleApproval(manager.id, manager.is_approved)}
                            disabled={!!updatingId}
                            title={manager.is_approved ? "Revoke approval" : "Approve manager"}
                            className={cn(
                              "p-2 rounded-lg transition-colors text-white",
                              manager.is_approved
                                ? "hover:text-crimson-400 hover:bg-crimson-500/10 active:bg-crimson-500/20"
                                : "hover:text-pitch-400 hover:bg-pitch-500/10 active:bg-pitch-500/20"
                            )}
                          >
                            {updatingId === manager.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : manager.is_approved ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                        )}
                        <button
                          onClick={() => toggleRole(manager.id, manager.role)}
                          disabled={!!updatingId}
                          title={`Switch to ${manager.role === 'super_admin' ? 'Manager' : 'Super Admin'}`}
                          className="p-2 text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 active:bg-amber-500/20 rounded-lg transition-colors"
                        >
                          {updatingId === manager.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Crown size={16} />}
                        </button>
                        <button
                          onClick={() => deleteUser(manager.id)}
                          disabled={!!deletingId}
                          title="Delete user"
                          className="p-2 text-gray-600 hover:text-crimson-400 hover:bg-crimson-500/10 active:bg-crimson-500/20 rounded-lg transition-colors"
                        >
                          {deletingId === manager.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Trash2 size={16} />}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ))}

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
