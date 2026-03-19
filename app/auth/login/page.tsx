'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }

    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email first. Check your inbox.')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      // Get role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()

      toast.success('Signed in! 🏏', { duration: 1000 })

      // Navigate — DashboardShell will handle the session client-side
      const dest = profile?.role === 'super_admin'
        ? '/dashboard/admin'
        : '/dashboard/manager'

      // Allow Supabase cookie synchronization to settle gracefully 
      setTimeout(() => {
        window.location.href = dest
      }, 400)

    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-glow pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-pitch-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-pitch-600 rounded-2xl mb-4 shadow-glow-green"
          >
            <Trophy size={30} className="text-white" />
          </motion.div>
          <h1 className="text-5xl font-display text-white tracking-wider">
            CRICK<span className="gradient-text">ARENA</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to manage your tournaments</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 px-4 py-3 bg-crimson-500/10 border border-crimson-500/30 rounded-xl mb-5 text-sm text-crimson-400"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className="input-arena"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400 font-medium">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-pitch-400 hover:text-pitch-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPass(e.target.value); setError('') }}
                  className="input-arena pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-glow-green">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-arena-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-arena-card px-3 text-xs text-gray-600">New to CrickArena?</span>
            </div>
          </div>

          <Link href="/auth/register"
            className="block w-full py-3 border border-arena-border hover:border-pitch-600/60 text-center text-sm font-medium text-gray-300 hover:text-white rounded-xl transition-all duration-200">
            Create an account
          </Link>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2024 CrickArena · All rights reserved to <span className="text-gray-500">Prajwal Korgaonkar</span>
        </p>
      </motion.div>
    </div>
  )
}
