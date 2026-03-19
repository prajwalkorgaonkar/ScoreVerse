'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Loader2, ArrowLeft, Mail, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email) { setErrorMsg('Please enter your email address'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/auth/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pitch-600 rounded-2xl mb-4 shadow-glow-green">
            <Trophy size={30} className="text-white" />
          </div>
          <h1 className="text-5xl font-display text-white tracking-wider">
            CRICK<span className="gradient-text">ARENA</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Reset your password</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-card">
          {sent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-5">
              <div className="w-16 h-16 bg-pitch-600/20 border-2 border-pitch-500 rounded-full flex items-center justify-center mx-auto">
                <Check size={28} className="text-pitch-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Check your inbox</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We sent a password reset link to<br />
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>
              <p className="text-gray-600 text-xs">
                Didn't receive it? Check your spam folder, or{' '}
                <button onClick={() => setSent(false)} className="text-pitch-400 hover:text-pitch-300">
                  try again
                </button>
              </p>
              <Link href="/auth/login"
                className="block w-full py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-colors text-center text-sm">
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-1">Forgot your password?</h2>
                <p className="text-gray-500 text-sm">
                  Enter your account email and we'll send you a reset link.
                </p>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                    className="input-arena"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> Sending…</>
                    : <><Mail size={18} /> Send Reset Link</>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2024 CrickArena · All rights reserved to <span className="text-gray-500">Prajwal Korgaonkar</span>
        </p>
      </motion.div>
    </div>
  )
}
