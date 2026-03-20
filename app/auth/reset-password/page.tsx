'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [errorMsg, setErrorMsg]   = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters'); return }
    if (password !== confirm)  { setErrorMsg('Passwords do not match'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully!')
      // Hard redirect so the fresh session is always picked up
      setTimeout(() => { window.location.replace('/dashboard') }, 1200)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. The link may have expired.')
      setLoading(false)
    }
  }

  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthColor = ['', 'bg-crimson-500', 'bg-amber-500', 'bg-pitch-500', 'bg-pitch-400']
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-glow pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-pitch-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pitch-600 rounded-2xl mb-4 shadow-glow-green">
            <Trophy size={30} className="text-white" />
          </div>
          <h1 className="text-5xl font-display text-white tracking-wider">
            SCORE<span className="gradient-text">VERSE</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Set a new password</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Create new password</h2>
            <p className="text-gray-500 text-sm">Choose a strong password for your account.</p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 px-4 py-3 bg-crimson-500/10 border border-crimson-500/30 rounded-xl mb-5 text-sm text-crimson-400"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMsg('') }}
                  className="input-arena pr-12"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength ? strengthColor[strength] : 'bg-arena-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${
                    strength <= 1 ? 'text-crimson-400'
                    : strength <= 2 ? 'text-amber-400'
                    : 'text-pitch-400'
                  }`}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrorMsg('') }}
                  className={`input-arena pr-12 ${
                    confirm && confirm !== password ? 'border-crimson-500/50'
                    : confirm && confirm === password ? 'border-pitch-500/50' : ''
                  }`}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
                {confirm && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {confirm === password
                      ? <Check size={16} className="text-pitch-400" />
                      : <AlertCircle size={16} className="text-crimson-400" />
                    }
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow-green"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Updating…</>
                : <><Check size={18} /> Update Password</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2024 ScoreVerse · All rights reserved to{' '}
          <span className="text-gray-500">Prajwal Korgaonkar</span>
        </p>
      </motion.div>
    </div>
  )
}
