'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Send, MessageCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareMenuProps {
  match: {
    id: string
    share_token: string
    team1?: { short_name: string }
    team2?: { short_name: string }
    tournament?: { name: string }
  }
  className?: string
  variant?: 'ghost' | 'primary' | 'outline'
  showText?: boolean
  iconSize?: number
}

export function ShareMenu({ match, className = '', variant = 'ghost', showText = true, iconSize = 14 }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/match/live/${match.share_token}`
  const shareTitle = `${match.team1?.short_name || 'Team 1'} vs ${match.team2?.short_name || 'Team 2'} - ScoreVerse Live`
  const shareText = `Check out the live scores for ${shareTitle}! ${match.tournament ? `[${match.tournament.name}]` : ''}`

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        })
        return true
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
        }
        return false
      }
    }
    return false
  }

  const handleShareClick = async () => {
    const shared = await handleNativeShare()
    if (!shared) {
      setIsOpen(!isOpen)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
    setIsOpen(false)
  }

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    window.open(url, '_blank')
    setIsOpen(false)
  }

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
    setIsOpen(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buttonClasses = variant === 'ghost' 
    ? 'text-gray-400 hover:text-white transition-colors flex items-center gap-1.5'
    : variant === 'outline'
    ? 'flex items-center gap-2 px-3 py-1.5 bg-arena-card/50 hover:bg-arena-border/30 text-gray-300 text-xs font-medium rounded-lg border border-arena-border transition-colors'
    : 'btn-primary px-4 py-2 flex items-center gap-2'

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button 
        onClick={handleShareClick}
        className={buttonClasses}
      >
        <Share2 size={iconSize} />
        {showText && <span>Share</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-48 bg-arena-card border border-arena-border rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            <div className="p-1.5 space-y-1">
              <button 
                onClick={shareWhatsApp}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-pitch-600/20 hover:text-pitch-400 rounded-lg transition-all text-left"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <MessageCircle size={14} />
                </div>
                WhatsApp
              </button>
              
              <button 
                onClick={shareTelegram}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-pitch-600/20 hover:text-pitch-400 rounded-lg transition-all text-left"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Send size={14} />
                </div>
                Telegram
              </button>

              <div className="h-px bg-arena-border/50 mx-2 my-1" />

              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-pitch-600/20 hover:text-pitch-400 rounded-lg transition-all text-left"
              >
                <div className="w-6 h-6 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-500">
                  {copied ? <Check size={14} className="text-pitch-400" /> : <Copy size={14} />}
                </div>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
