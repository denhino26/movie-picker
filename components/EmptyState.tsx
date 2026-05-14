import { GenreName, LanguageCode, YearRangeKey, YEAR_RANGES, LANGUAGE_OPTIONS } from '@/types/movie'
import { t, UILanguage } from '@/lib/translations'

interface EmptyStateProps {
  onRetry: () => void
  onBack: () => void
  contentType?: 'film' | 'serie'
  selectedGenres?: GenreName[]
  language?: LanguageCode
  yearRanges?: YearRangeKey[]
  uiLang: UILanguage
}

export default function EmptyState({
  onRetry,
  onBack,
  contentType = 'film',
  selectedGenres = [],
  language = 'en',
  yearRanges = [],
  uiLang,
}: EmptyStateProps) {
  const T = (key: string) => t(uiLang, key)
  const hints: string[] = []

  if (language !== 'en' && language !== 'all') {
    hints.push(`${T('hintTryLanguage')} 🌐 ${T('hintAllLanguages')} ${T('hintOrEnglish')} 🇺🇸 ${T('hintEnglish')} — ${LANGUAGE_OPTIONS[language].label} ${T('hintFewerTitles')}`)
  }
  if (yearRanges.length > 0) {
    const labels = yearRanges.map((k) => YEAR_RANGES[k].label).join(', ')
    hints.push(`${T('hintRemovePeriod')} (${labels})`)
  }
  if (selectedGenres.length > 1) {
    hints.push(T('hintTryOneGenre'))
  }
  if (selectedGenres.includes('18+')) {
    hints.push(T('hintAdultScarce'))
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center px-4 animate-fade-in">
      <div className="text-6xl">{contentType === 'serie' ? '📺' : '🎬'}</div>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-white">
          {contentType === 'serie' ? T('noSeriesFound') : T('noFilmsFound')}
        </h3>
        <p className="text-cinema-muted text-sm">{T('forYourSelection')}</p>
      </div>

      {hints.length > 0 && (
        <div className="w-full bg-cinema-card border border-white/10 rounded-2xl p-4 space-y-2 text-left">
          <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">{T('suggestions')}</p>
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
          {T('adjustFilters')}
        </button>
        <button
          onClick={onRetry}
          className="w-full px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium
                     transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/40"
        >
          {T('tryAgain')}
        </button>
      </div>
    </div>
  )
}
