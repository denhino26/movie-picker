'use client'

import Link from 'next/link'
import { Film, Tv } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-cinema flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            🎯 Entertainment Hub
          </h1>
          <p className="text-cinema-muted text-sm sm:text-base">
            Wat wil je doen?
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/tv"
            className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl
                       bg-cinema-card border border-white/5 hover:border-red-500/50
                       transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-900/20"
          >
            <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center
                            group-hover:bg-red-600/30 transition-colors">
              <Tv size={32} className="text-red-500" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">TV Kijken</h2>
              <p className="text-cinema-muted text-sm">
                Films &amp; series ontdekken
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-700/30">
                🎬 Films
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/30">
                📺 Series
              </span>
            </div>
          </Link>

          <Link
            href="/padel"
            className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl
                       bg-cinema-card border border-white/5 hover:border-emerald-500/50
                       transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-900/20"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center
                            group-hover:bg-emerald-600/30 transition-colors">
              <span className="text-3xl">🏸</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white">Padel Kijken</h2>
              <p className="text-cinema-muted text-sm">
                Live standen &amp; programma
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/30">
                🔴 Live scores
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/30">
                📅 Programma
              </span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
