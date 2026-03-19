'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Shield, Bell, Database, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    allowPublicRegistration: true,
    requireEmailConfirmation: true,
    maxMatchesPerManager: 50,
    defaultOvers: 20,
    defaultPlayers: 11,
    enableRealtime: true,
    autoEndInnings: true,
  })

  const handleSave = async () => {
    setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ value, onChange, label, description }: any) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-pitch-600' : 'bg-arena-muted'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display text-white tracking-wide">SYSTEM <span className="gradient-text-gold">SETTINGS</span></h1>
        <p className="text-gray-500 mt-1">Super Admin only — system configuration</p>
      </div>

      {/* Auth Settings */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-arena-border">
          <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-amber-400" />
          </div>
          <h2 className="font-semibold text-white">Authentication</h2>
        </div>
        <div className="space-y-1 divide-y divide-arena-border/50">
          <Toggle
            value={settings.allowPublicRegistration}
            onChange={(v: boolean) => setSettings(s => ({ ...s, allowPublicRegistration: v }))}
            label="Allow Public Registration"
            description="Let anyone sign up as a Manager"
          />
          <Toggle
            value={settings.requireEmailConfirmation}
            onChange={(v: boolean) => setSettings(s => ({ ...s, requireEmailConfirmation: v }))}
            label="Require Email Confirmation"
            description="New accounts must verify email before logging in"
          />
        </div>
      </motion.div>

      {/* Match Defaults */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-arena-border">
          <div className="w-9 h-9 bg-pitch-500/10 rounded-xl flex items-center justify-center">
            <Database size={18} className="text-pitch-400" />
          </div>
          <h2 className="font-semibold text-white">Match Defaults</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Default Overs</label>
            <input
              type="number"
              value={settings.defaultOvers}
              onChange={e => setSettings(s => ({ ...s, defaultOvers: parseInt(e.target.value) || 20 }))}
              className="input-arena"
              min={1} max={50}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Default Players</label>
            <input
              type="number"
              value={settings.defaultPlayers}
              onChange={e => setSettings(s => ({ ...s, defaultPlayers: parseInt(e.target.value) || 11 }))}
              className="input-arena"
              min={2} max={15}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Max Matches per Manager</label>
            <input
              type="number"
              value={settings.maxMatchesPerManager}
              onChange={e => setSettings(s => ({ ...s, maxMatchesPerManager: parseInt(e.target.value) || 50 }))}
              className="input-arena"
              min={1} max={500}
            />
          </div>
        </div>
      </motion.div>

      {/* Platform Settings */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-arena-border">
          <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Bell size={18} className="text-blue-400" />
          </div>
          <h2 className="font-semibold text-white">Platform</h2>
        </div>
        <div className="space-y-1 divide-y divide-arena-border/50">
          <Toggle
            value={settings.enableRealtime}
            onChange={(v: boolean) => setSettings(s => ({ ...s, enableRealtime: v }))}
            label="Enable Realtime Updates"
            description="Push live ball-by-ball updates to public viewers via Supabase Realtime"
          />
          <Toggle
            value={settings.autoEndInnings}
            onChange={(v: boolean) => setSettings(s => ({ ...s, autoEndInnings: v }))}
            label="Auto-End Innings"
            description="Automatically close innings when all overs/wickets are exhausted"
          />
        </div>
      </motion.div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-8 py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-colors shadow-glow-green"
      >
        {saved ? <Check size={18} /> : <Settings size={18} />}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>

      <p className="text-xs text-gray-600 text-center pb-4">
        © 2024 CrickArena — All rights reserved to Prajwal Korgaonkar
      </p>
    </div>
  )
}
