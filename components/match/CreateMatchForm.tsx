'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Users, Trophy, MapPin, ChevronRight, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateShareToken } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  tournaments: any[]
  teams: any[]
  userId: string
  role: string
}

export default function CreateMatchForm({ tournaments, teams: initTeams, userId, role }: Props) {
  const router = useRouter()
  const [localTeams, setLocalTeams] = useState(initTeams)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [customName, setCustomName] = useState({ team1_id: '', team2_id: '' })
  const [loadingTeam, setLoadingTeam] = useState<string | null>(null)
  const [form, setForm] = useState({
    tournament_id: '',
    team1_id: '',
    team2_id: '',
    total_overs: 20,
    players_per_team: 11,
    venue: '',
    description: '',
  })

  const base = role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'

  const filteredTeams = form.tournament_id
    ? localTeams.filter(t => t.tournament_id === form.tournament_id)
    : localTeams

  const team1 = localTeams.find(t => t.id === form.team1_id)
  const team2 = localTeams.find(t => t.id === form.team2_id)
  const tournament = tournaments.find(t => t.id === form.tournament_id)

  const handleQuickCreate = async (field: 'team1_id' | 'team2_id') => {
    const name = customName[field].trim()
    if (!name) return

    // Check if team already exists locally
    const existing = localTeams.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      setForm(f => ({ ...f, [field]: existing.id }))
      setCustomName(prev => ({ ...prev, [field]: '' }))
      toast.success('Selected existing team')
      return
    }

    setLoadingTeam(field)
    try {
      let short_name = name.length > 3 ? name.substring(0, 3).toUpperCase() : name.toUpperCase()
      const words = name.split(' ')
      if (words.length > 1) {
        short_name = words.map(w => w[0]).join('').substring(0, 3).toUpperCase()
      }
      
      const color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
      const supabase = createClient()
      const { data, error } = await supabase.from('teams').insert({
        name,
        short_name,
        color,
        created_by: userId,
        tournament_id: form.tournament_id || null
      }).select().single()

      if (error) throw error

      setLocalTeams(prev => [...prev, data])
      setForm(f => ({ ...f, [field]: data.id }))
      setCustomName(prev => ({ ...prev, [field]: '' }))
      toast.success(`Team "${name}" created & selected!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create team')
    } finally {
      setLoadingTeam(null)
    }
  }

  const handleCreate = async () => {
    if (!form.team1_id || !form.team2_id) return toast.error('Please select both teams')
    if (form.team1_id === form.team2_id) return toast.error('Teams must be different')

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('matches').insert({
        ...form,
        tournament_id: form.tournament_id || null,
        share_token: generateShareToken(),
        status: 'scheduled',
        current_innings: 1,
        created_by: userId,
      }).select().single()

      if (error) throw error
      toast.success('Match created!')
      router.push(`${base}/matches/${data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { n: 1, label: 'Tournament' },
    { n: 2, label: 'Teams' },
    { n: 3, label: 'Settings' },
    { n: 4, label: 'Review' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-display text-white tracking-wide">CREATE <span className="gradient-text">MATCH</span></h1>
        <p className="text-gray-500 mt-1">Set up a new match in a few steps</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button
              onClick={() => step > s.n && setStep(s.n)}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                step > s.n ? 'bg-pitch-600 text-white cursor-pointer' :
                step === s.n ? 'bg-pitch-600 text-white ring-2 ring-pitch-600/30' :
                'bg-arena-card border border-arena-border text-gray-500'
              }`}
            >
              {step > s.n ? <Check size={14} /> : s.n}
            </button>
            <span className={`text-xs ${step === s.n ? 'text-white' : 'text-gray-600'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-arena-border mx-1" />}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Tournament */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Trophy size={20} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Select Tournament</h2>
                  <p className="text-xs text-gray-500">Optional — link this match to a tournament</p>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => { setForm(f => ({ ...f, tournament_id: '' })); setStep(2) }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    !form.tournament_id
                      ? 'border-pitch-500 bg-pitch-500/10'
                      : 'border-arena-border hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-white">No Tournament</div>
                  <div className="text-xs text-gray-500 mt-0.5">Standalone match</div>
                </button>
                {tournaments.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setForm(f => ({ ...f, tournament_id: t.id })); setStep(2) }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.tournament_id === t.id
                        ? 'border-pitch-500 bg-pitch-500/10'
                        : 'border-arena-border hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.format}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Teams */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pitch-500/10 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-pitch-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Select Teams</h2>
                  <p className="text-xs text-gray-500">Choose the two competing teams</p>
                </div>
              </div>

              {['team1_id', 'team2_id'].map((field, fi) => (
                <div key={field} className="bg-arena-card/30 p-4 rounded-2xl border border-arena-border">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm text-gray-400 font-medium">
                      {fi === 0 ? 'Team 1' : 'Team 2'}
                    </label>
                    {form[field as keyof typeof form] && (
                      <span className="text-xs bg-pitch-600/20 text-pitch-400 px-2 py-1 rounded-lg">
                        Selected: {localTeams.find(t => t.id === form[field as keyof typeof form])?.name}
                      </span>
                    )}
                  </div>

                  {/* Inline Creation Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Type custom team name..."
                      className="input-arena flex-1"
                      value={customName[field as keyof typeof customName]}
                      onChange={(e) => setCustomName(prev => ({...prev, [field]: e.target.value}))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleQuickCreate(field as 'team1_id' | 'team2_id')
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => handleQuickCreate(field as 'team1_id' | 'team2_id')} 
                      disabled={loadingTeam === field || !customName[field as keyof typeof customName].trim()}
                      className="px-4 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors min-w-[80px]"
                    >
                      {loadingTeam === field ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Add'}
                    </button>
                  </div>

                  <div className="text-xs text-center text-gray-600 mb-3">— OR SELECT EXISTING —</div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                    {filteredTeams
                      .filter(t => field === 'team1_id' ? t.id !== form.team2_id : t.id !== form.team1_id)
                      .map(team => (
                        <button
                          key={team.id}
                          onClick={() => setForm(f => ({ ...f, [field]: team.id }))}
                          className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            form[field as keyof typeof form] === team.id
                              ? 'border-pitch-500 bg-pitch-500/10'
                              : 'border-arena-border hover:border-gray-600'
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-xs font-medium text-white truncate">{team.short_name}</span>
                        </button>
                      ))
                    }
                    {filteredTeams.length === 0 && (
                      <p className="col-span-full text-gray-500 text-xs py-2 text-center">
                        No existing teams found.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.team1_id || !form.team2_id || form.team1_id === form.team2_id}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Swords size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Match Settings</h2>
                  <p className="text-xs text-gray-500">Configure overs, players, and venue</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Overs per Innings</label>
                  <div className="flex items-center gap-3">
                    {[5, 10, 20, 50].map(o => (
                      <button
                        key={o}
                        onClick={() => setForm(f => ({ ...f, total_overs: o }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.total_overs === o
                            ? 'bg-pitch-600 text-white'
                            : 'bg-arena-card border border-arena-border text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={form.total_overs}
                    onChange={e => setForm(f => ({ ...f, total_overs: parseInt(e.target.value) || 20 }))}
                    min={1} max={50}
                    className="input-arena mt-2"
                    placeholder="Custom overs"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Players per Team</label>
                  <div className="flex items-center gap-3">
                    {[6, 8, 11].map(p => (
                      <button
                        key={p}
                        onClick={() => setForm(f => ({ ...f, players_per_team: p }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.players_per_team === p
                            ? 'bg-pitch-600 text-white'
                            : 'bg-arena-card border border-arena-border text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={form.players_per_team}
                    onChange={e => setForm(f => ({ ...f, players_per_team: parseInt(e.target.value) || 11 }))}
                    min={2} max={15}
                    className="input-arena mt-2"
                    placeholder="Custom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  Venue <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                  className="input-arena"
                  placeholder="e.g. Wankhede Stadium, Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Match Description <span className="text-gray-600">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-arena min-h-[80px] py-3"
                  placeholder="Rules, match info, or special context..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(4)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Review <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pitch-500/10 rounded-xl flex items-center justify-center">
                  <Check size={20} className="text-pitch-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Review Match</h2>
                  <p className="text-xs text-gray-500">Confirm all details before creating</p>
                </div>
              </div>

              <div className="bg-arena-dark rounded-xl p-5 space-y-4">
                {tournament && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tournament</span>
                    <span className="text-white font-medium">{tournament.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Teams</span>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg" style={{ color: team1?.color }}>{team1?.short_name}</span>
                    <span className="text-gray-600 text-sm">VS</span>
                    <span className="font-display text-lg" style={{ color: team2?.color }}>{team2?.short_name}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Overs</span>
                  <span className="text-white">{form.total_overs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Players per team</span>
                  <span className="text-white">{form.players_per_team}</span>
                </div>
                {form.venue && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Venue</span>
                    <span className="text-white">{form.venue}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(3)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Creating...' : 'Create Match'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
