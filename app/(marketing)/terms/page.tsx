'use client'

import { motion } from 'framer-motion'
import { FileText, Gavel, Users, AlertCircle } from 'lucide-react'

export default function TermsOfServicePage() {
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
            <Gavel size={32} className="text-pitch-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display text-white mb-4">TERMS OF <span className="gradient-text">SERVICE</span></h1>
          <p className="text-gray-400">Effective Date: March 20, 2026</p>
        </motion.div>

        <div className="space-y-12">
          {/* Acceptance */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-3">
              <FileText className="text-pitch-400" size={24} />
              1. ACCEPTANCE OF TERMS
            </h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              By accessing or using ScoreVerse, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you may not use our services. ScoreVerse provides tournament management software for recreational and professional cricket.
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-3">
              <Users className="text-pitch-400" size={24} />
              2. USER RESPONSIBILITIES
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed text-sm">
              <p>
                As a tournament manager or super-admin, you are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ensuring the accuracy of scores and player data entered.</li>
                <li>Maintaining the confidentiality of your account credentials.</li>
                <li>Ensuring that match descriptions and team names comply with community standards.</li>
              </ul>
            </div>
          </section>

          {/* Service Availability */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-3">
              <AlertCircle className="text-pitch-400" size={24} />
              3. SERVICE LIMITS & DISCLAIMER
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed text-sm text-center md:text-left">
              <p>
                ScoreVerse is provided "as is" and "as available." While we strive for 100% uptime for live scoring, we do not guarantee uninterrupted service during critical match periods.
              </p>
              <p className="bg-arena-dark/50 p-4 rounded-xl text-amber-500 font-medium border border-amber-500/20">
                ScoreVerse is a tool for management and is not responsible for any tournament outcomes, financial disputes, or data entry errors by users.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50">
            <h2 className="text-2xl font-display text-white mb-4">4. INTELLECTUAL PROPERTY</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The ScoreVerse platform, including its design, logo, and scoring algorithms, is the property of ScoreVerse. Users retain ownership of the specific tournament data they enter, but grant ScoreVerse the right to display this data publicly via Share Tokens.
            </p>
          </section>

          {/* Termination */}
          <section className="glass-card rounded-2xl p-8 border border-arena-border/50 text-center">
            <p className="text-gray-500 mb-2">Need to contact our legal team?</p>
            <p className="text-white font-medium">scoreversebusiness@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
