'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, CheckCircle, SkipForward, Heart, ChevronDown, ChevronUp, Play } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Movie } from '@/types/movie'
import { getPosterUrl } from '@/lib/utils'

interface MovieCardProps {
  movie: Movie
  genreNames: string[]
  contentType: 'film' | 'serie'
  onPerfect: () => void
  onSeen: () => void
  onNext: () => void
}

function StarRating({ score }: { score: number }) {
  const stars = Math.round(score / 2)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= stars ? 'star-filled fill-current' : 'star-empty'}
        />
      ))}
      <span className="text-xs text-cinema-muted ml-1">{score.toFixed(1)}</span>
    </div>
  )
}

export default function MovieCard({ movie, genreNames, contentType, onPerfect, onSeen, onNext }: MovieCardProps) {
  const [expanded,      setExpanded]      = useState(false)
  const [trailerLoading, setTrailerLoading] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [movie.id])

  const openTrailer = async () => {
    setTrailerLoading(true)
    try {
      const res  = await fetch(`/api/trailer?id=${movie.id}&type=${contentType}`)
      const data = await res.json()
      if (data.key) {
        window.open(`https://www.youtube.com/watch?v=${data.key}`, '_blank')
      } else {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((movie.title || movie.name || '') + ' trailer')}`, '_blank')
      }
    } finally {
      setTrailerLoading(false)
    }
  }

  const handlePerfect = () => {
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e50914', '#f5c518', '#ffffff', '#ff6b6b', '#fbbf24'],
    })
    onPerfect()
  }

  const posterUrl    = getPosterUrl(movie.poster_path)
  const displayTitle = movie.title || movie.name || 'Onbekend'
  const dateStr      = movie.release_date || movie.first_air_date || ''
  const year         = dateStr.slice(0, 4)
  const overview     = movie.overview || ''
  const isLong       = overview.length > 160

  return (
    <div className="animate-slide-up w-full max-w-sm mx-auto">
      <div className="bg-cinema-card rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5">
        {/* Poster */}
        <div className="relative h-56 sm:h-80 w-full bg-cinema-surface">
          <Image
            src={posterUrl}
            alt={displayTitle}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 384px"
            unoptimized={posterUrl.endsWith('.svg')}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cinema-card to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-white leading-tight">{displayTitle}</h2>
            {contentType === 'serie' && (
              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                📺 Serie
              </span>
            )}
          </div>

          {/* Genre tags */}
          <div className="flex flex-wrap gap-2">
            {genreNames.map((name) => (
              <span
                key={name}
                className="text-xs px-2 py-1 rounded-full bg-cinema-surface text-cinema-muted border border-white/10"
              >
                {name}
              </span>
            ))}
          </div>

          {/* Rating + year */}
          <div className="flex items-center justify-between">
            <StarRating score={movie.vote_average} />
            {year && <span className="text-xs text-cinema-muted">{year}</span>}
          </div>

          {/* Description with expand/collapse */}
          <div>
            <p className={`text-sm text-cinema-muted leading-relaxed transition-all duration-300 ${expanded ? '' : 'line-clamp-3'}`}>
              {overview || 'Geen beschrijving beschikbaar.'}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1.5 flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                {expanded
                  ? <><ChevronUp size={13} /> Minder</>
                  : <><ChevronDown size={13} /> Meer lezen</>
                }
              </button>
            )}
          </div>

          {/* Trailer button */}
          <button
            onClick={openTrailer}
            disabled={trailerLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                       bg-cinema-surface hover:bg-white/10 text-cinema-muted hover:text-white
                       border border-white/10 text-sm transition-all duration-200 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={14} />
            {trailerLoading ? 'Laden...' : '▶ Bekijk trailer'}
          </button>

          {/* Action buttons */}
          <div className="pt-1 space-y-2">
            <button
              onClick={handlePerfect}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-red-600 hover:bg-red-500 text-white font-semibold text-sm
                         transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/40"
            >
              <Heart size={16} />
              Perfecte keuze
            </button>
            <div className="flex gap-2">
              <button
                onClick={onSeen}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-cinema-surface hover:bg-white/10 text-cinema-muted hover:text-white
                           border border-white/10 text-sm transition-all duration-200 active:scale-95"
              >
                <CheckCircle size={15} />
                Al gezien
              </button>
              <button
                onClick={onNext}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-cinema-surface hover:bg-white/10 text-cinema-muted hover:text-white
                           border border-white/10 text-sm transition-all duration-200 active:scale-95"
              >
                <SkipForward size={15} />
                {contentType === 'serie' ? 'Nieuwe serie' : 'Nieuwe film'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
