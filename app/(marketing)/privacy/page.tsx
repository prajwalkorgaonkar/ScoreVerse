'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Server } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-arena-dark pt-32 pb-20 px-6">
      <div className="fixed inset-0 bg-green-glow pointer-events-none opacity-40" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-pitch-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} className="text-pitch-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display text-white mb-4">PRIVACY <span className="gradient-text">POLICY</span></h1>
          <p className="text-gray-400">Last Updated: March 20, 2026</p>
        </motion.div>

        <div className="space-y-12">
          {/* Introduction */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-3">
              <Eye className="text-pitch-400" size={24} />
              1. INTRODUCTION
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
              <p>
                At ScoreVerse, your privacy is our top priority. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our cricket tournament management platform.
              </p>
              <p>
                By using ScoreVerse, you agree to the collection and use of information in accordance with this policy. We are committed to ensuring that your data is handled with the highest level of security and transparency.
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-3">
              <Lock className="text-pitch-400" size={24} />
              2. INFORMATION WE COLLECT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-arena-dark/50 rounded-xl border border-arena-border">
                <h3 className="text-white font-semibold mb-2">Personal Data</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  When you register, we collect your name, email address, and profile preferences to provide a personalized management experience.
                </p>
              </div>
              <div className="p-4 bg-arena-dark/50 rounded-xl border border-arena-border">
                <h3 className="text-white font-semibold mb-2">Match Data</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Tournament details, team names, and player statistics entered into the platform are stored securely to provide live scoring services.
                </p>
              </div>
            </div>
          </section>

          {/* How we use data */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-3">
              <Server className="text-pitch-400" size={24} />
              3. DATA STORAGE & SECURITY
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
              <p>
                We use **Supabase** (powered by AWS/PostgreSQL) for secure cloud storage. All sensitive data is encrypted at rest and in transit.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>We do not sell your personal data to third parties.</li>
                <li>Your service role keys and passwords are never logged or exposed.</li>
                <li>Live match "Share Tokens" are unique and generated cryptographically.</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4">4. COOKIES</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              ScoreVerse uses essential cookies for authentication (Supabase/Next.js). These cookies ensure you remain logged in while managing your matches. We do not use invasive tracking or advertising cookies.
            </p>
          </section>

          {/* Contact */}
          <div className="text-center pt-8 border-t border-arena-border/30">
            <p className="text-gray-500 mb-2">Have questions about your data?</p>
            <p className="text-white font-medium">scoreversebusiness@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
