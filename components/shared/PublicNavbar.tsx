'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Menu, X, ChevronRight, Shield, CircleDot, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Live Scores', href: '/scores' },
  { name: 'Guide', href: '/guide' },
  { name: 'Features', href: '/#features' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    
    const loadProfile = async (session: any) => {
      if (session?.user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        
        if (error) {
           console.warn("Database RLS Warning on profiles:", error.message)
           // Fallback to the session JWT metadata if the database RLS fails
           setProfile({
             id: session.user.id,
             full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
             role: session.user.user_metadata?.role || 'manager'
           })
        } else if (data) {
           setProfile(data)
        }
      } else {
        setProfile(null)
      }
      setLoadingUser(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    setProfile(null)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || mobileMenuOpen
            ? 'bg-arena-dark/80 backdrop-blur-xl border-b border-arena-border shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-pitch-600 rounded-xl flex items-center justify-center group-hover:bg-pitch-500 transition-colors shadow-glow-green">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-2xl font-display text-white tracking-wider">
              SCORE<span className="text-pitch-500">VERSE</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-white',
                    isActive ? 'text-pitch-400' : 'text-gray-400'
                  )}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {loadingUser ? (
              <div className="w-24 h-10 rounded-full bg-white/5 animate-pulse" />
            ) : profile ? (
              <div className="flex items-center gap-3">
                <Link
                  href={profile.role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'}
                  className="flex items-center gap-3 px-2 py-1.5 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group shadow-glow-green/20 hover:shadow-glow-green"
                >
                  <div className="w-8 h-8 rounded-full bg-pitch-600 flex items-center justify-center text-white text-sm font-bold shadow-glow-green group-hover:scale-105 transition-transform">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white flex items-center gap-1.5">
                    {profile.role === 'super_admin' ? <Shield size={12} className="text-amber-400" /> : <CircleDot size={12} className="text-pitch-400" />}
                    Dashboard
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-500 hover:text-crimson-400 transition-colors rounded-xl hover:bg-white/5"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2.5 bg-pitch-600 hover:bg-pitch-500 text-white text-sm rounded-xl transition-colors font-medium shadow-glow-green flex items-center gap-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-20 bottom-0 z-40 bg-arena-dark/95 backdrop-blur-3xl md:hidden overflow-y-auto"
          >
            <div className="flex flex-col px-6 pt-10 pb-12 space-y-2">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4 px-1">Navigation</div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-display text-gray-300 hover:text-white flex items-center justify-between group"
                >
                  {link.name}
                  <ChevronRight size={20} className="text-pitch-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              
              <div className="pt-8 mt-8 border-t border-arena-border/50 flex flex-col gap-4">
                {loadingUser ? null : profile ? (
                  <Link
                    href={profile.role === 'super_admin' ? '/dashboard/admin' : '/dashboard/manager'}
                    className="w-full py-4 flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all shadow-glow-green/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-pitch-600 flex items-center justify-center text-white text-xs font-bold">
                      {profile.full_name?.charAt(0).toUpperCase()}
                    </div>
                    {profile.full_name}'s Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="w-full py-4 text-center border border-arena-border hover:border-gray-500 text-white font-medium rounded-xl transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="w-full py-4 text-center bg-pitch-600 hover:bg-pitch-500 text-white font-medium rounded-xl transition-colors shadow-glow-green"
                    >
                      Get Started for Free
                    </Link>
                  </>
                )}
                {profile && (
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 flex items-center justify-center gap-2 text-gray-500 hover:text-crimson-400 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
