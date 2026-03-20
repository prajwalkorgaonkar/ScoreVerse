'use client'

import { useState } from 'react'
import { Activity, Mail, Globe, Phone } from 'lucide-react'
import PublicNavbar from '@/components/shared/PublicNavbar'

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("https://formspree.io/f/myknoojn", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="bg-arena-dark min-h-screen">
      <PublicNavbar />
      
      <div className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pitch-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 max-w-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pitch-600/10 border border-pitch-600/20 text-pitch-400 text-xs font-bold tracking-widest uppercase mb-6">
                <Activity size={14} className="animate-pulse" />
                Let's Talk
              </div>
              <h1 className="text-5xl md:text-6xl font-display text-white tracking-wider mb-6">
                GET IN <span className="gradient-text">TOUCH</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Whether you're looking to run a global tournament or simply want to experience our scorekeeping application, our support team is available around the clock.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-glow-green/20">
                  <Mail className="text-pitch-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Email Support</h3>
                  <a href="mailto:scoreversebusiness@gmail.com" className="text-gray-400 hover:text-pitch-400 transition-colors">scoreversebusiness@gmail.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-glow-green/20">
                  <Phone className="text-amber-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Call Us</h3>
                  <p className="text-gray-400">+91 7821811018</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-glow-green/20">
                  <Globe className="text-crimson-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Operating Region</h3>
                  <p className="text-gray-400">100% Online Platform<br/>Available Worldwide</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 md:p-10 border border-pitch-600/20 shadow-glow-green/10">
            <h2 className="text-2xl font-display text-white mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">First Name</label>
                  <input type="text" name="firstName" className="input-arena" placeholder="John" required disabled={status === "submitting"} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Name</label>
                  <input type="text" name="lastName" className="input-arena" placeholder="Doe" required disabled={status === "submitting"} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input type="email" name="email" className="input-arena" placeholder="john@example.com" required disabled={status === "submitting"} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</label>
                <textarea name="message" rows={4} className="input-arena py-3 resize-none" placeholder="How can we help you?" required disabled={status === "submitting"} />
              </div>
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className={`w-full py-4 font-bold tracking-wide mt-4 uppercase rounded-xl transition-all duration-300 ${
                  status === "success" ? "bg-green-500 text-white shadow-glow-green" : 
                  status === "error" ? "bg-red-500 text-white" : 
                  "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50 border border-green-500/30"
                }`}
              >
                {status === "idle" ? "Send Transmission" : 
                 status === "submitting" ? "Sending..." : 
                 status === "success" ? "Transmission Sent!" : 
                 "Error Sending - Try Again"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
