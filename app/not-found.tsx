import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-arena-dark flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-9xl font-display text-arena-muted mb-6">404</div>
        <div className="w-16 h-16 bg-pitch-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Trophy size={28} className="text-pitch-400" />
        </div>
        <h1 className="text-3xl font-display text-white mb-3">PAGE <span className="gradient-text">NOT FOUND</span></h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-semibold rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
