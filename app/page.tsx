'use client'

import { useState, useCallback } from 'react'
import { GenreName, Movie, AppPhase, ContentType, FILM_GENRES, SERIE_GENRES, YearRangeKey, LanguageCode, YEAR_RANGES } from '@/types/movie'
import TypeSelector from '@/components/TypeSelector'
import GenreSelector from '@/components/GenreSelector'
import YearRangeSelector from '@/components/YearRangeSelector'
import LanguageSelector from '@/components/LanguageSelector'
import LoadingAnimation from '@/components/LoadingAnimation'
import MovieCard from '@/components/MovieCard'
import EmptyState from '@/components/EmptyState'

const TMDB_GENRE_NAMES: Record<number, string> = {
  18:    'Drama',
  28:    'Actie',
  53:    'Thriller',
  27:    'Horror',
  35:    'Comedy',
  10749: 'Romance',
  878:   'Sci-Fi',
  12:    'Avontuur',
  14:    'Fantasy',
  80:    'Misdaad',
  99:    'Documentaire',
  10752: 'Oorlog',
  36:    'Geschiedenis',
  10751: 'Familie',
  16:    'Tekenfilm',
  10402: 'Muziek',
  37:    'Western',
  10759: 'Actie & Avontuur',
  10765: 'Sci-Fi & Fantasy',
  9648:  'Mystery',
  10764: 'Reality',
  10762: 'Kids',
  10763: 'Nieuws',
  10766: 'Soap',
  10767: 'Talkshow',
  10768: 'Oorlog & Politiek',
}

function resolveGenreNames(ids: number[]): string[] {
  return ids.map((id) => TMDB_GENRE_NAMES[id] ?? `Genre ${id}`)
}

export default function Home() {
  const [contentType,    setContentType]    = useState<ContentType>('film')
  const [selectedGenres, setSelectedGenres] = useState<GenreName[]>([])
  const [yearRanges,     setYearRanges]     = useState<YearRangeKey[]>([])
  const [language,       setLanguage]       = useState<LanguageCode>('en')
  const [movies,         setMovies]         = useState<Movie[]>([])
  const [currentIndex,   setCurrentIndex]   = useState(0)
  const [seenMovies,     setSeenMovies]     = useState<Set<number>>(new Set())
  const [phase,          setPhase]          = useState<AppPhase>('type-select')
  const [currentPage,    setCurrentPage]    = useState(1)
  const [totalPages,     setTotalPages]     = useState(1)

  const toggleYearRange = (key: YearRangeKey) => {
    setYearRanges((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleTypeSelect = (type: ContentType) => {
    setContentType(type)
    setSelectedGenres([])
    setYearRanges([])
    setPhase('select')
  }

  const toggleGenre = (genre: GenreName) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const searchMovies = useCallback(
    async (page: number, existingMovies: Movie[] = [], existingSeen: Set<number> = seenMovies) => {
      if (page === 1) setPhase('loading')

      try {
        const params = new URLSearchParams({
          genres:     selectedGenres.join(','),
          page:       String(page),
          type:       contentType,
          language:   language,
          yearRanges: yearRanges.join(','),
        })

        const res  = await fetch(`/api/movies?${params.toString()}`)
        const data = await res.json()

        if (!res.ok) { setPhase('empty'); return }

        const fresh    = (data.results as Movie[]).filter((m) => !existingSeen.has(m.id))
        const combined = page === 1 ? fresh : [...existingMovies, ...fresh]

        if (combined.length === 0) { setPhase('empty'); return }

        setMovies(combined)
        setCurrentIndex(page === 1 ? 0 : existingMovies.length)
        setCurrentPage(page)
        setTotalPages(data.total_pages ?? 1)
        setPhase('results')
      } catch {
        setPhase('empty')
      }
    },
    [selectedGenres, seenMovies, contentType, language, yearRanges]
  )

  const advanceMovie = useCallback(
    (markSeen: boolean) => {
      const current = movies[currentIndex]
      let newSeen   = seenMovies

      if (markSeen && current) {
        newSeen = new Set([...seenMovies, current.id])
        setSeenMovies(newSeen)
      }

      const nextIndex = currentIndex + 1

      if (nextIndex >= movies.length) {
        if (currentPage < totalPages) {
          searchMovies(currentPage + 1, movies, newSeen)
        } else {
          setPhase('empty')
        }
        return
      }

      setCurrentIndex(nextIndex)
    },
    [movies, currentIndex, seenMovies, currentPage, totalPages, searchMovies]
  )

  const handlePerfect = () => {
    setPhase('success')
    setTimeout(() => advanceMovie(false), 2200)
  }

  const reset = () => {
    setMovies([])
    setCurrentIndex(0)
    setCurrentPage(1)
    setTotalPages(1)
    setSeenMovies(new Set())
    setYearRanges([])
    setPhase('type-select')
  }

  const backToGenres = () => {
    setMovies([])
    setCurrentIndex(0)
    setCurrentPage(1)
    setTotalPages(1)
    setPhase('select')
  }

  const activeGenres = contentType === 'serie' ? SERIE_GENRES : FILM_GENRES
  const zoekLabel    = contentType === 'serie' ? 'Zoek serie' : 'Zoek film'

  return (
    <main className="min-h-screen bg-gradient-cinema px-4 py-6 sm:py-12">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <button
            onClick={phase !== 'type-select' ? reset : undefined}
            className={`text-4xl font-bold text-white tracking-tight transition-opacity duration-200
              ${phase !== 'type-select' ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}`}
          >
            🎬 Movie Picker
          </button>
          <p className="text-cinema-muted">Vind jouw volgende favoriete {contentType === 'serie' ? 'serie' : 'film'}</p>
        </div>

        {/* Type selection */}
        {phase === 'type-select' && (
          <TypeSelector onSelect={handleTypeSelect} />
        )}

        {/* Genre selection + loading */}
        {(phase === 'select' || phase === 'loading') && (
          <div className="space-y-5 animate-fade-in">
            {/* Back to type */}
            <button
              onClick={reset}
              className="flex items-center gap-1 text-sm text-cinema-muted hover:text-white transition-colors"
            >
              ← {contentType === 'serie' ? '📺 Serie' : '🎬 Film'} wijzigen
            </button>

            <LanguageSelector
              selected={language}
              onSelect={setLanguage}
              disabled={phase === 'loading'}
            />

            <div className="border-t border-white/5" />

            <YearRangeSelector
              selected={yearRanges}
              onToggle={toggleYearRange}
              disabled={phase === 'loading'}
            />

            <div className="border-t border-white/5" />

            <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider text-center">
              Genre
            </p>

            <GenreSelector
              genres={activeGenres}
              selectedGenres={selectedGenres}
              onToggle={toggleGenre}
              onClearAll={() => setSelectedGenres([])}
              disabled={phase === 'loading'}
            />

            {phase === 'select' && (
              <button
                onClick={() => searchMovies(1)}
                disabled={false}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500
                           disabled:opacity-40 disabled:cursor-not-allowed
                           text-white font-semibold text-lg
                           transition-all duration-200 active:scale-[0.98]
                           shadow-xl shadow-red-900/40"
              >
                {zoekLabel}
              </button>
            )}

            {phase === 'loading' && <LoadingAnimation />}
          </div>
        )}

        {/* Results */}
        {phase === 'results' && movies[currentIndex] && (
          <div className="space-y-4">
            {yearRanges.length > 0 && (
              <p className="text-center text-xs text-cinema-muted">
                {yearRanges.map((k) => YEAR_RANGES[k].label).join(' · ')}
              </p>
            )}
            <MovieCard
              movie={movies[currentIndex]}
              genreNames={resolveGenreNames(movies[currentIndex].genre_ids)}
              contentType={contentType}
              onPerfect={handlePerfect}
              onSeen={() => advanceMovie(true)}
              onNext={() => advanceMovie(false)}
            />
            <button
              onClick={backToGenres}
              className="w-full text-center text-sm text-cinema-muted hover:text-white transition-colors py-2"
            >
              ← Andere genres kiezen
            </button>
          </div>
        )}

        {/* Empty */}
        {phase === 'empty' && <EmptyState onRetry={reset} contentType={contentType} />}

        {/* Success */}
        {phase === 'success' && (
          <div className="text-center py-16 space-y-4 animate-fade-in">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold text-white">Geweldige keuze!</h3>
            <p className="text-cinema-muted">
              Geniet van de {contentType === 'serie' ? 'serie' : 'film'}!
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
