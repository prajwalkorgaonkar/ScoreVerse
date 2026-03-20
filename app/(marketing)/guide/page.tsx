import { Smartphone, Trophy, Users, Shield, Activity, FileText, Zap, Globe, Plus, Flag, PenTool } from 'lucide-react'
import PublicNavbar from '@/components/shared/PublicNavbar'

export const metadata = {
  title: 'Platform Guide — ScoreVerse',
  description: 'Learn how to use ScoreVerse as a viewer or a tournament manager.',
}

export default function GuidePage() {
  return (
    <div className="bg-arena-dark min-h-screen">
      <PublicNavbar />
      
      <div className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pitch-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pitch-600/10 border border-pitch-600/20 text-pitch-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-glow-green">
              <Zap size={14} />
              Platform Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-display text-white tracking-wider">
              HOW IT <span className="gradient-text">WORKS</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about using ScoreVerse, whether you're following your favorite local team or organizing an entire global tournament.
            </p>
          </div>

          <div className="space-y-24">
            
            {/* Viewer Level */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-glow-amber">
                  <Smartphone className="text-amber-400" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-display text-white">For Viewers</h2>
                  <p className="text-gray-400">Follow the action in real-time, completely free.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-amber-500/30 transition-colors">
                  <Activity className="text-amber-400 mb-4" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2">Live Ball-by-Ball Scores</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Access our Global Match Hub to watch live scoring updates on any match globally without reloading the page. Follow run-rates, partnerships, and fall-of-wickets seamlessly.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-amber-500/30 transition-colors">
                  <Globe className="text-amber-400 mb-4" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2">Match Discovery</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Use our smart search functionality to locate your favorite teams, local matches, or international tournaments instantly.
                  </p>
                </div>
                
                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-amber-500/30 transition-colors">
                  <FileText className="text-amber-400 mb-4" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2">PDF Scorecard Exports</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Once a match concludes, you can instantly export a beautiful, print-ready PDF scorecard analyzing both innings to keep as a souvenir.
                  </p>
                </div>
                
                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-amber-500/30 transition-colors">
                  <Trophy className="text-amber-400 mb-4" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2">Tournament Standings</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Keep track of points tables, net run rates, and team standings as they automatically update at the end of every official tournament match.
                  </p>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-arena-border/50 relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-arena-dark px-4 text-gray-500">
                <Shield size={20} />
              </div>
            </div>

            {/* Manager Level */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-pitch-600/10 border border-pitch-600/20 flex items-center justify-center shadow-glow-green">
                  <Shield className="text-pitch-400" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-display text-white">For Managers & Organizers</h2>
                  <p className="text-gray-400">Tools to automate, organize, and effortlessly govern your tournaments.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-pitch-500/30 transition-colors">
                  <Trophy className="text-pitch-400 mb-4" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2">Create Tournaments</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Launch T20, ODI, or custom box-cricket tournaments. Define the format, dates, overs limit, and promote your tournament publicly so spectators can find it.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-pitch-500/30 transition-colors">
                  <Users className="text-pitch-400 mb-4" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2">Team & Player Rosters</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Build out teams, assign custom colors and short names, and add detailed player rosters representing their batting and bowling styles.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-pitch-500/30 transition-colors">
                  <Flag className="text-pitch-400 mb-4" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2">Schedule & Toss Handling</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Instantly pair teams for upcoming matches. Right before a match starts, digitally log the toss winner and their decision to bat or bowl first.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-arena-border hover:border-pitch-500/30 transition-colors relative overflow-hidden group">
                  <div className="absolute inset-0 bg-pitch-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-3xl" />
                  <PenTool className="text-pitch-400 mb-4 relative z-10" size={28} />
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">Advanced Digital Scoring Console</h3>
                  <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                    The crown jewel for managers. Access an intuitive scorer dashboard to instantly log dots, boundaries, extras, and wickets. The console handles all the complex match math for you automatically.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 text-center p-8 bg-arena-card/30 rounded-3xl border border-arena-border">
                <h3 className="text-xl text-white font-medium mb-3">Ready to start managing?</h3>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Creating a manager account is completely free. Register your profile to access all professional governance tools right away.
                </p>
                <a href="/auth/register" className="bg-green-600 hover:bg-green-500 text-white uppercase text-sm tracking-widest px-8 py-4 rounded-full font-bold shadow-lg border border-green-500/30 transition-all inline-block">
                  Create Manager Account
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
