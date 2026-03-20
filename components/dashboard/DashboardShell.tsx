'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, LayoutDashboard, Users, Swords, BarChart3,
  Settings, LogOut, Menu, X, ChevronRight, Shield,
  UserCog, CircleDot, Activity, Home
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

const adminNav = [
  { icon: Home,            label: 'Public Home',     href: '/' },
  { icon: LayoutDashboard, label: 'Overview',        href: '/dashboard/admin' },
  { icon: Trophy,          label: 'Tournaments',     href: '/dashboard/admin/tournaments' },
  { icon: Swords,          label: 'Matches',         href: '/dashboard/admin/matches' },
  { icon: Activity,        label: 'Live Scores',     href: '/scores' },
  { icon: Users,           label: 'Teams & Players', href: '/dashboard/admin/teams' },
  { icon: UserCog,         label: 'Managers',        href: '/dashboard/admin/managers' },
  { icon: BarChart3,       label: 'Analytics',       href: '/dashboard/admin/analytics' },
  { icon: Settings,        label: 'Settings',        href: '/dashboard/admin/settings' },
]

const managerNav = [
  { icon: Home,            label: 'Public Home',     href: '/' },
  { icon: LayoutDashboard, label: 'Overview',        href: '/dashboard/manager' },
  { icon: Trophy,          label: 'Tournaments',     href: '/dashboard/manager/tournaments' },
  { icon: Swords,          label: 'My Matches',      href: '/dashboard/manager/matches' },
  { icon: Activity,        label: 'Live Scores',     href: '/scores' },
  { icon: Users,           label: 'Teams & Players', href: '/dashboard/manager/teams' },
  { icon: BarChart3,       label: 'Stats',           href: '/dashboard/manager/stats' },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [profile, setProfile]   = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        window.location.replace('/auth/login')
        return
      }

      const { data: p, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error || !p) {
        setProfile({
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || 'User',
          role: session.user.user_metadata?.role || 'manager'
        })
      } else {
        setProfile(p)
      }
      setChecking(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    setTimeout(() => {
      window.location.replace('/')
    }, 400)
  }

  const isAdmin = profile?.role === 'super_admin'
  const nav     = isAdmin ? adminNav : managerNav

  if (checking) {
    return (
      <div className="flex h-screen bg-arena-dark overflow-hidden">
        <aside className="hidden lg:flex w-64 border-r border-arena-border bg-arena-card flex-col flex-shrink-0 p-6 space-y-8">
          <Skeleton className="h-10 w-32" />
          <div className="space-y-4">
             {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-arena-border bg-arena-card/50 flex items-center px-6">
            <Skeleton className="h-4 w-48" />
          </header>
          <main className="p-8 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    )
  }

  if (pathname.startsWith('/dashboard/admin') && !isAdmin) {
    window.location.replace('/dashboard/manager')
    return null
  }

  const NavLinks = () => (
    <>
      {nav.map((item) => {
        const isOverview = item.href === '/dashboard/admin' || item.href === '/dashboard/manager'
        const active = isOverview ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
              active
                ? 'bg-pitch-600/20 text-pitch-400 border border-pitch-600/30 shadow-glow-green/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}>
            {active && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-pitch-500 rounded-r-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon size={18} className={active ? 'text-pitch-400' : 'text-gray-500 group-hover:text-gray-300'} />
            {item.label}
            {active && <ChevronRight size={14} className="ml-auto text-pitch-500/50" />}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex h-screen bg-arena-dark overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 border-r border-arena-border bg-arena-card flex-col flex-shrink-0">
        <div className="p-6 border-b border-arena-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-pitch-600 rounded-lg flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <span className="text-xl font-display text-white tracking-wider">
              SCORE<span className="text-pitch-500">VERSE</span>
            </span>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-arena-border">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wider',
            isAdmin
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-pitch-600/10 text-pitch-400 border border-pitch-600/20'
          )}>
            {isAdmin ? <Shield size={13} /> : <CircleDot size={13} />}
            {isAdmin ? 'SUPER ADMIN' : 'MANAGER'}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-arena-border bg-arena-dark/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-pitch-600/30 border border-pitch-600/50 flex items-center justify-center text-pitch-400 text-xs font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{profile?.full_name}</div>
              <div className="text-xs text-gray-500 truncate">{profile?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-crimson-400 hover:bg-crimson-500/10 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-arena-card border-r border-arena-border flex flex-col lg:hidden">
              <div className="p-5 border-b border-arena-border flex items-center justify-between">
                <span className="text-lg font-display text-white tracking-wider">
                  SCORE<span className="text-pitch-500">VERSE</span>
                </span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <NavLinks />
              </nav>
              <div className="p-4 border-t border-arena-border">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-crimson-400 hover:bg-crimson-500/10 transition-all">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 border-b border-arena-border bg-arena-card/50 backdrop-blur flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1">
            <Menu size={22} />
          </button>
          
          <div className="flex-1 hidden sm:block ml-4">
            <Breadcrumbs />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            {/* Desktop Horizontal Navbar */}
            <nav className="hidden xl:flex items-center gap-6 mr-4 pr-6 border-r border-arena-border">
              <Link href="/" className="text-sm font-medium text-gray-400 hover:text-pitch-400 transition-colors">Home</Link>
              <Link href="/guide" className="text-sm font-medium text-gray-400 hover:text-pitch-400 transition-colors">Guide</Link>
              <Link href="/scores" className="text-sm font-medium text-pitch-400 hover:text-pitch-300 transition-colors">Live Scores</Link>
            </nav>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-pitch-600/30 border border-pitch-600/50 flex items-center justify-center text-pitch-400 text-xs font-bold">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 hidden md:block">{profile?.full_name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 lg:p-6 pb-20">{children}</div>
        </main>

        <footer className="border-t border-arena-border/50 px-6 py-3 flex-shrink-0 bg-arena-card/30">
          <p className="text-center text-gray-700 text-[10px] uppercase tracking-widest">
            © 2026 ScoreVerse · All rights reserved to <span className="text-gray-600 hover:text-gray-400 cursor-default transition-colors">Prajwal Korgaonkar</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
