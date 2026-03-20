'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  match: any
  onComplete: () => void
}

export default function CoinToss({ match, onComplete }: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<'select' | 'flipping' | 'result'>(
    match.toss_winner_id ? 'result' : 'select'
  )
  const [selectedTeam, setSelectedTeam] = useState<string>(match.toss_winner_id || '')
  const [tossWinner, setTossWinner] = useState<string>(match.toss_winner_id || '')
  const [tossChoice, setTossChoice] = useState<'bat' | 'bowl'>(match.toss_choice || 'bat')
  const [saving, setSaving] = useState(false)
  const [coinFace, setCoinFace] = useState<'heads' | 'tails'>('heads')

  const handleFlip = async () => {
    if (!selectedTeam) return toast.error('Select a team to call the toss')
    setPhase('flipping')

    // Simulate coin flip animation
    let flips = 0
    const flipInterval = setInterval(() => {
      setCoinFace(f => f === 'heads' ? 'tails' : 'heads')
      flips++
      if (flips >= 10) {
        clearInterval(flipInterval)
        // Random winner
        const winner = Math.random() > 0.5 ? match.team1_id : match.team2_id
        setTossWinner(winner)
        setCoinFace(Math.random() > 0.5 ? 'heads' : 'tails')
        setTimeout(() => setPhase('result'), 500)
      }
    }, 150)
  }

  const saveToss = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('matches').update({
        toss_winner_id: tossWinner,
        toss_choice: tossChoice,
        status: 'toss',
      }).eq('id', match.id)

      toast.success('Toss recorded!')
      router.refresh()
      onComplete()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save toss')
    } finally {
      setSaving(false)
    }
  }

  const winnerTeam = tossWinner === match.team1_id ? match.team1 : match.team2

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display text-white mb-1">COIN <span className="gradient-text">TOSS</span></h2>
        <p className="text-gray-500 text-sm">Who calls it?</p>
      </div>

      {/* Coin */}
      <div className="flex justify-center py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase + coinFace}
            animate={phase === 'flipping' ? {
              rotateY: [0, 180, 360, 540, 720, 900, 1080],
              scale: [1, 1.1, 1, 1.1, 1, 1.1, 1],
            } : { rotateY: 0, scale: 1 }}
            transition={{ duration: phase === 'flipping' ? 1.5 : 0.3 }}
            className={cn(
              'w-28 h-28 rounded-full flex items-center justify-center text-4xl font-display shadow-2xl border-4 select-none',
              coinFace === 'heads'
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 shadow-amber-500/30'
                : 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300 shadow-gray-500/30'
            )}
          >
            {coinFace === 'heads' ? '🏏' : '🪙'}
          </motion.div>
        </AnimatePresence>
      </div>

      {phase === 'select' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-3 text-center">Which team calls the toss?</p>
            <div className="grid grid-cols-2 gap-3">
              {[match.team1, match.team2].map((team: any) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all font-display text-lg',
                    selectedTeam === team.id
                      ? 'border-current bg-current/10'
                      : 'border-arena-border hover:border-gray-600'
                  )}
                  style={selectedTeam === team.id ? { color: team.color, borderColor: team.color } : undefined}
                >
                  {team.short_name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleFlip}
            disabled={!selectedTeam}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg rounded-xl transition-colors shadow-glow-amber"
          >
            🪙 Flip Coin!
          </button>
        </motion.div>
      )}

      {phase === 'flipping' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
          <div className="text-xl font-display text-white animate-pulse">FLIPPING...</div>
        </motion.div>
      )}

      {phase === 'result' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5"
        >
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-5xl mb-3"
            >
              🎉
            </motion.div>
            <div className="text-xl font-display text-white mb-1">
              <span style={{ color: winnerTeam?.color }}>{winnerTeam?.name}</span> wins the toss!
            </div>
          </div>

          {!match.toss_winner_id && (
            <>
              <div>
                <p className="text-sm text-gray-400 mb-3 text-center">
                  <strong className="text-white">{winnerTeam?.short_name}</strong> elects to...
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(['bat', 'bowl'] as const).map(choice => (
                    <button
                      key={choice}
                      onClick={() => setTossChoice(choice)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all font-semibold capitalize',
                        tossChoice === choice
                          ? 'border-pitch-500 bg-pitch-500/10 text-pitch-400'
                          : 'border-arena-border text-gray-400 hover:border-gray-500'
                      )}
                    >
                      {choice === 'bat' ? '🏏 Bat' : '⚾ Bowl'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveToss}
                disabled={saving}
                className="w-full py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Saving...' : 'Confirm Toss'}
              </button>
            </>
          )}

          {match.toss_winner_id && (
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-pitch-400 font-medium">
                {winnerTeam?.name} won toss — chose to <strong>{match.toss_choice}</strong> first
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
