'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPass]     = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [sent, setSent]         = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!fullName.trim()) { setError('Please enter your full name'); return }
    if (!email)           { setError('Please enter your email'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim(), role: 'manager' },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Try signing in.')
        } else {
          setError(signUpError.message)
        }
        return
      }
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3
  const strengthColor = ['', 'bg-crimson-500', 'bg-amber-500', 'bg-pitch-500', 'bg-pitch-400']

  if (sent) {
    return (
      <div className="min-h-screen bg-arena-dark flex items-center justify-center px-6 relative">
        <div className="absolute inset-0 bg-green-glow pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center relative z-10"
        >
          <div className="glass-card rounded-2xl p-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-pitch-600/20 border-2 border-pitch-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check size={36} className="text-pitch-400" />
            </motion.div>
            <h2 className="text-3xl font-display text-white mb-3">
              CHECK YOUR <span className="gradient-text">EMAIL</span>
            </h2>
            <p className="text-gray-400 mb-1">We sent a confirmation link to</p>
            <p className="text-white font-medium mb-6">{email}</p>
            <p className="text-gray-500 text-sm mb-8">
              Click the link in the email to activate your account, then sign in.
            </p>
            <Link
              href="/auth/login"
              className="block w-full py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-colors text-center"
            >
              Go to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-glow pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-pitch-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
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
          <p className="text-gray-500 mt-2 text-sm">Create your manager account</p>
        </div>

        {/* Card */}
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

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setError('') }}
                className="input-arena"
                placeholder="Virat Kohli"
                autoComplete="name"
                required
              />
            </div>

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
              <label className="block text-sm text-gray-400 mb-2 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPass(e.target.value); setError('') }}
                  className="input-arena pr-12"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < strength ? strengthColor[strength] : 'bg-arena-muted'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow-green"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Creating account…</>
                : 'Create Account'
              }
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-arena-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-arena-card px-3 text-xs text-gray-600">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="block w-full py-3 border border-arena-border hover:border-pitch-600/60 text-center text-sm font-medium text-gray-300 hover:text-white rounded-xl transition-all"
          >
            Sign in instead
          </Link>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2024 CrickArena · All rights reserved to{' '}
          <span className="text-gray-500">Prajwal Korgaonkar</span>
        </p>
      </motion.div>
    </div>
  )
}
