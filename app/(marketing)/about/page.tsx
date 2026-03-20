import { Trophy, Target, Shield, Zap } from 'lucide-react'
import PublicNavbar from '@/components/shared/PublicNavbar'

export const dynamic = 'force-static'

export default function AboutPage() {
  const values = [
    {
      icon: <Target size={24} className="text-pitch-400" />,
      title: 'Precision Metrics',
      text: 'Every single ball, run, and catch is explicitly logged guaranteeing mathematically perfect Net Run Rates and points tracking.'
    },
    {
      icon: <Zap size={24} className="text-amber-400" />,
      title: 'Real-Time Sync',
      text: 'Our global architecture ensures Live Scorecards natively synchronize to zero-delay server sockets around the globe.'
    },
    {
      icon: <Shield size={24} className="text-crimson-400" />,
      title: 'Secure Infrastructure',
      text: 'Strict explicitly bounded role-based auth chains natively lock down scoring matrices ensuring bulletproof tournament integrity.'
    }
  ]

  return (
    <div className="bg-arena-dark min-h-screen">
      <PublicNavbar />
      
      <div className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pitch-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-glow-green">
            <Trophy size={14} />
            Our Vision
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display text-white tracking-wider leading-tight">
            REDEFINING <span className="gradient-text">CRICKET</span><br/>MANAGEMENT
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            ScoreVerse was built implicitly to strip away the chaos of local manual tournament accounting. 
            We provide a sleek, fully automated digital scoreboard platform globally accessible by anyone, anywhere.
          </p>
          
        </div>

        <div className="max-w-6xl mx-auto relative z-10 mt-24 grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div key={i} className="glass-card rounded-3xl p-8 hover:border-pitch-600/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {v.icon}
              </div>
              <h3 className="text-xl font-display text-white mb-3">{v.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {v.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
