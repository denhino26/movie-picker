'use client'

import { ContentType } from '@/types/movie'

interface TypeSelectorProps {
  onSelect: (type: ContentType) => void
}

export default function TypeSelector({ onSelect }: TypeSelectorProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-center text-cinema-muted text-sm">Wat wil je vanavond kijken?</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('film')}
          className="flex flex-col items-center justify-center gap-3 p-5 sm:p-8 rounded-2xl
                     bg-cinema-card border border-white/10
                     hover:border-red-500/60 hover:bg-cinema-card/80
                     transition-all duration-200 active:scale-95 group"
        >
          <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-200">🎬</span>
          <span className="text-white font-semibold text-base sm:text-lg">Film</span>
          <span className="text-cinema-muted text-xs text-center">Speelfilm, documentaire, animatie</span>
        </button>
        <button
          onClick={() => onSelect('serie')}
          className="flex flex-col items-center justify-center gap-3 p-5 sm:p-8 rounded-2xl
                     bg-cinema-card border border-white/10
                     hover:border-red-500/60 hover:bg-cinema-card/80
                     transition-all duration-200 active:scale-95 group"
        >
          <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-200">📺</span>
          <span className="text-white font-semibold text-base sm:text-lg">Serie</span>
          <span className="text-cinema-muted text-xs text-center">TV-series, miniseries, reality</span>
        </button>
      </div>
    </div>
  )
}
