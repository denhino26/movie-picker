'use client'

import { GenreName, GENRE_LABELS } from '@/types/movie'

interface GenreSelectorProps {
  genres: GenreName[]
  selectedGenres: GenreName[]
  onToggle: (genre: GenreName) => void
  disabled?: boolean
}

export default function GenreSelector({ genres, selectedGenres, onToggle, disabled, onClearAll }: GenreSelectorProps & { onClearAll: () => void }) {
  const allSelected = selectedGenres.length === 0
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={onClearAll}
        disabled={disabled}
        className={`
          px-3 py-2.5 rounded-full border text-sm font-medium min-h-[44px] sm:min-h-0 sm:py-1.5
          transition-all duration-200 select-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${allSelected
            ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/40 scale-105'
            : 'bg-cinema-surface text-cinema-text border-cinema-card hover:border-red-500/50 hover:text-white'
          }
        `}
      >
        🎲 Alle
      </button>
      {genres.map((genre) => {
        const isSelected = selectedGenres.includes(genre)
        return (
          <button
            key={genre}
            onClick={() => onToggle(genre)}
            disabled={disabled}
            className={`
              px-3 py-2.5 rounded-full border text-sm font-medium min-h-[44px] sm:min-h-0 sm:py-1.5
              transition-all duration-200 select-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isSelected
                ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/40 scale-105'
                : 'bg-cinema-surface text-cinema-text border-cinema-card hover:border-red-500/50 hover:text-white'
              }
            `}
          >
            {GENRE_LABELS[genre]}
          </button>
        )
      })}
    </div>
  )
}
