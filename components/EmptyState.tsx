import { GenreName, LanguageCode, YearRangeKey, YEAR_RANGES, LANGUAGE_OPTIONS } from '@/types/movie'

interface EmptyStateProps {
  onRetry: () => void
  onBack: () => void
  contentType?: 'film' | 'serie'
  selectedGenres?: GenreName[]
  language?: LanguageCode
  yearRanges?: YearRangeKey[]
}

export default function EmptyState({
  onRetry,
  onBack,
  contentType = 'film',
  selectedGenres = [],
  language = 'en',
  yearRanges = [],
}: EmptyStateProps) {
  const hints: string[] = []

  if (language !== 'en' && language !== 'all') {
    hints.push(`Probeer 🌐 Alle talen of 🇺🇸 Engels — ${LANGUAGE_OPTIONS[language].label} heeft minder titels`)
  }
  if (yearRanges.length > 0) {
    const labels = yearRanges.map((k) => YEAR_RANGES[k].label).join(', ')
    hints.push(`Verwijder de periodefilter (${labels}) om meer resultaten te zien`)
  }
  if (selectedGenres.length > 1) {
    hints.push(`Probeer één genre tegelijk — combinaties beperken de resultaten sterk`)
  }
  if (selectedGenres.includes('18+')) {
    hints.push(`18+ heeft weinig titels met rating — probeer zonder 18+ filter`)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center px-4 animate-fade-in">
      <div className="text-6xl">{contentType === 'serie' ? '📺' : '🎬'}</div>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-white">
          Geen {contentType === 'serie' ? 'series' : 'films'} gevonden
        </h3>
        <p className="text-cinema-muted text-sm">voor jouw selectie</p>
      </div>

      {hints.length > 0 && (
        <div className="w-full bg-cinema-card border border-white/10 rounded-2xl p-4 space-y-2 text-left">
          <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">Suggesties</p>
          <ul className="space-y-2">
            {hints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-cinema-text">
                <span className="text-amber-400 mt-0.5 shrink-0">→</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={onBack}
          className="w-full px-6 py-3 rounded-xl bg-cinema-card hover:bg-white/10 text-white border border-white/10
                     font-medium transition-all duration-200 active:scale-95"
        >
          ← Filters aanpassen
        </button>
        <button
          onClick={onRetry}
          className="w-full px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium
                     transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/40"
        >
          Opnieuw proberen
        </button>
      </div>
    </div>
  )
}
