'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Zap, Shield, Users, BarChart3, Share2, ArrowRight, Circle, ChevronRight } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Live Ball-by-Ball', desc: 'Real-time scoring with instant updates powered by Supabase Realtime' },
  { icon: Trophy, title: 'Tournament Management', desc: 'Full tournament lifecycle from creation to trophy ceremony' },
  { icon: Share2, title: 'Instant Sharing', desc: 'Share live match link via unique token — no login required for viewers' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Super Admin, Manager, and Public viewer roles with granular permissions' },
  { icon: BarChart3, title: 'Rich Analytics', desc: 'Points table, NRR, player stats, and match history at a glance' },
  { icon: Users, title: 'Team & Player Management', desc: 'Full roster management with individual player statistics' },
]

const stats = [
  { value: '10K+', label: 'Matches Scored' },
  { value: '500+', label: 'Tournaments' },
  { value: '50K+', label: 'Players' },
  { value: '99.9%', label: 'Uptime' },
]

export default function HomePage() {
  const [ticker, setTicker] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTicker(p => (p + 1) % 4), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-arena-dark overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-arena-border/50 bg-arena-dark/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-pitch-600 rounded-lg flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <span className="text-xl font-display text-white tracking-wider">CRICK<span className="text-pitch-500">ARENA</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-5 py-2 bg-pitch-600 hover:bg-pitch-500 text-white text-sm rounded-lg transition-colors font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-green-glow pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-pitch-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-crimson-500/10 border border-crimson-500/30 rounded-full mb-8"
          >
            <span className="live-dot" />
            <span className="text-crimson-400 text-sm font-medium">Live Scoring Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-9xl font-display text-white leading-none mb-6"
          >
            CRICK<span className="gradient-text">ARENA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The premium cricket tournament management platform. Live ball-by-ball scoring, 
            real-time sharing, and comprehensive analytics — all in one arena.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/auth/register"
              className="group flex items-center gap-2 px-8 py-4 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-glow-green"
            >
              Start Managing Matches
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-8 py-4 border border-arena-border hover:border-pitch-500 text-white font-medium rounded-xl transition-all duration-200"
            >
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Live score preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="max-w-2xl mx-auto mt-16"
        >
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-pitch-600 via-pitch-400 to-pitch-600" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="live-dot" />
                <span className="text-sm text-crimson-400 font-medium">LIVE</span>
              </div>
              <span className="text-xs text-gray-500">Premier League T20 • Over 15.3</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-display text-white">MUMBAI XI</div>
                <div className="text-5xl font-display gradient-text mt-1">187/4</div>
                <div className="text-gray-400 text-sm mt-1">15.3 overs • RR: 12.04</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Target</div>
                <div className="text-4xl font-display text-amber-400">210</div>
                <div className="text-sm text-amber-400 mt-1">Need 23 off 27</div>
              </div>
            </div>

            {/* Recent balls */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">This over:</span>
              {['1', '4', 'W', '0', '6', '1'].map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    b === 'W' ? 'bg-crimson-500 text-white' :
                    b === '6' ? 'bg-pitch-500 text-white' :
                    b === '4' ? 'bg-pitch-600 text-white' :
                    'bg-arena-muted text-gray-300'
                  }`}
                >
                  {b}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-arena-border/50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-display gradient-text-gold">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display text-white mb-4">BUILT FOR THE <span className="gradient-text">GAME</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every feature designed with cricket in mind. From toss to trophy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-6 hover:border-pitch-600/50 transition-colors group"
              >
                <div className="w-12 h-12 bg-pitch-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pitch-600/30 transition-colors">
                  <f.icon size={22} className="text-pitch-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pitch-600/10 to-transparent pointer-events-none" />
            <Trophy size={48} className="text-pitch-500 mx-auto mb-6" />
            <h2 className="text-5xl font-display text-white mb-4">READY TO <span className="gradient-text">PLAY?</span></h2>
            <p className="text-gray-400 mb-8">
              Set up your first tournament in minutes. No credit card required.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-glow-green text-lg"
            >
              Create Free Account
              <ChevronRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-arena-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-pitch-600 rounded flex items-center justify-center">
              <Trophy size={14} className="text-white" />
            </div>
            <span className="font-display text-white tracking-wider">CRICK<span className="text-pitch-500">ARENA</span></span>
          </div>
          <p className="text-gray-500 text-sm text-center">
            © 2024 CrickArena. All rights reserved to{' '}
            <span className="text-pitch-400 font-medium">Prajwal Korgaonkar</span>
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
