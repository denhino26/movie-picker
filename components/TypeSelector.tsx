'use client'

import { ContentType } from '@/types/movie'
import { t, UILanguage } from '@/lib/translations'

interface TypeSelectorProps {
  onSelect: (type: ContentType) => void
  uiLang: UILanguage
}

export default function TypeSelector({ onSelect, uiLang }: TypeSelectorProps) {
  const T = (key: string) => t(uiLang, key)
  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-center text-cinema-muted text-sm">{T('whatToWatch')}</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('film')}
          className="flex flex-col items-center justify-center gap-3 p-5 sm:p-8 rounded-2xl
                     bg-cinema-card border border-white/10
                     hover:border-red-500/60 hover:bg-cinema-card/80
                     transition-all duration-200 active:scale-95 group"
        >
          <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-200">🎬</span>
          <span className="text-white font-semibold text-base sm:text-lg">{T('filmLabel')}</span>
          <span className="text-cinema-muted text-xs text-center">{T('filmDesc')}</span>
        </button>
        <button
          onClick={() => onSelect('serie')}
          className="flex flex-col items-center justify-center gap-3 p-5 sm:p-8 rounded-2xl
                     bg-cinema-card border border-white/10
                     hover:border-red-500/60 hover:bg-cinema-card/80
                     transition-all duration-200 active:scale-95 group"
        >
          <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-200">📺</span>
          <span className="text-white font-semibold text-base sm:text-lg">{T('serieLabel')}</span>
          <span className="text-cinema-muted text-xs text-center">{T('serieDesc')}</span>
        </button>
      </div>
    </div>
  )
}
