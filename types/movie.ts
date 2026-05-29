export interface Movie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date?: string
  first_air_date?: string
  genre_ids: number[]
}

export interface TMDBResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export type ContentType = 'film' | 'serie'

export type GenreName =
  | 'drama' | 'actie' | 'spanning' | 'horror' | 'zombie'
  | 'comedy' | 'romance' | 'sci-fi' | 'thriller'
  | 'tekenfilm' | 'avontuur' | 'fantasy' | 'misdaad'
  | 'documentaire' | 'familie' | 'muziek' | 'western' | 'oorlog' | '18+'
  | 'sci-fi-fantasy' | 'mystery' | 'reality'

export type AppPhase =
  | 'type-select'
  | 'select'
  | 'loading'
  | 'results'
  | 'empty'
  | 'success'

export const FILM_GENRES: GenreName[] = [
  'actie', 'drama', 'comedy', 'horror', 'thriller',
  'sci-fi', 'avontuur', 'fantasy', 'romance', 'misdaad',
  'mystery', 'tekenfilm', 'familie', 'spanning', 'zombie',
  'documentaire', 'muziek', 'western', 'oorlog', '18+',
]

export const SERIE_GENRES: GenreName[] = [
  'drama', 'actie', 'comedy', 'misdaad', 'sci-fi-fantasy',
  'tekenfilm', 'familie', 'mystery', 'documentaire', 'reality',
  'spanning', 'romance', 'horror', '18+',
]

export const FILM_GENRE_MAP: Partial<Record<GenreName, number[]>> = {
  drama:        [18],
  actie:        [28],
  spanning:     [53],
  horror:       [27],
  zombie:       [27],
  comedy:       [35],
  romance:      [10749],
  'sci-fi':     [878],
  thriller:     [53],
  tekenfilm:    [16],
  avontuur:     [12],
  fantasy:      [14],
  misdaad:      [80],
  mystery:      [9648],
  documentaire: [99],
  familie:      [10751],
  muziek:       [10402],
  western:      [37],
  oorlog:       [10752],
  '18+':        [],
}

export const SERIE_GENRE_MAP: Partial<Record<GenreName, number[]>> = {
  drama:           [18],
  actie:           [10759],
  comedy:          [35],
  misdaad:         [80],
  'sci-fi-fantasy':[10765],
  tekenfilm:       [16],
  familie:         [10751],
  mystery:         [9648],
  documentaire:    [99],
  reality:         [10764],
  spanning:        [9648],
  romance:         [10749],
  horror:          [27],
  '18+':           [],
}

export const GENRE_LABELS: Record<GenreName, string> = {
  drama:           '🎭 Drama',
  actie:           '💥 Actie',
  spanning:        '😰 Spanning',
  horror:          '😱 Horror',
  zombie:          '🧟 Zombie',
  comedy:          '😂 Comedy',
  romance:         '❤️ Romance',
  'sci-fi':        '🚀 Sci-Fi',
  thriller:        '🔪 Thriller',
  tekenfilm:       '🎨 Tekenfilm',
  avontuur:        '🗺️ Avontuur',
  fantasy:         '🧙 Fantasy',
  misdaad:         '🕵️ Misdaad',
  documentaire:    '📽️ Documentaire',
  familie:         '👨‍👩‍👧 Familie',
  muziek:          '🎵 Muziek',
  western:         '🤠 Western',
  oorlog:          '⚔️ Oorlog',
  '18+':           '🔞 18+',
  'sci-fi-fantasy':'🚀 Sci-Fi & Fantasy',
  mystery:         '🔍 Mystery',
  reality:         '📺 Reality',
}

export const ZOMBIE_KEYWORD_ID = 190370

// ── Year ranges (multi-select) ──────────────────────────────────────────────
export type YearRangeKey = 'nieuw' | 'recent' | '2010s' | '2000s' | '1990s' | '1980s' | 'classic'

export interface YearRangeOption {
  label: string
  gte?: string
  lte?: string
}

export const YEAR_RANGES: Record<YearRangeKey, YearRangeOption> = {
  nieuw:   { label: '🔥 Net uit',     gte: 'NIEUW' },
  recent:  { label: '🆕 2020 – nu',   gte: '2020-01-01' },
  '2010s': { label: '📅 2010 – 2019', gte: '2010-01-01', lte: '2019-12-31' },
  '2000s': { label: '📅 2000 – 2009', gte: '2000-01-01', lte: '2009-12-31' },
  '1990s': { label: '📅 1990 – 1999', gte: '1990-01-01', lte: '1999-12-31' },
  '1980s': { label: '📅 1980 – 1989', gte: '1980-01-01', lte: '1989-12-31' },
  classic: { label: '🎞️ Voor 1980',   lte: '1979-12-31' },
}

export const ALL_YEAR_RANGES: YearRangeKey[] = [
  'nieuw', 'recent', '2010s', '2000s', '1990s', '1980s', 'classic',
]

// When multiple ranges are selected, compute the overall min/max window
export function computeDateRange(selected: YearRangeKey[]): { gte?: string; lte?: string } {
  if (selected.length === 0) return {}

  // Special case: "nieuw" = last 3 months up to 2 weeks ahead
  if (selected.includes('nieuw')) {
    const now = new Date()
    const threeMonthsAgo = new Date(now.getTime() - 90 * 86400000)
    const twoWeeksAhead = new Date(now.getTime() + 14 * 86400000)
    return {
      gte: threeMonthsAgo.toISOString().split('T')[0],
      lte: twoWeeksAhead.toISOString().split('T')[0],
    }
  }

  const ranges = selected.map((k) => YEAR_RANGES[k])
  const gtes   = ranges.filter((r) => r.gte).map((r) => r.gte!)
  const ltes   = ranges.filter((r) => r.lte).map((r) => r.lte!)
  const hasOpenEnd = selected.includes('recent')
  return {
    gte: gtes.length > 0 ? [...gtes].sort()[0] : undefined,
    lte: hasOpenEnd || ltes.length === 0 ? undefined : [...ltes].sort().reverse()[0],
  }
}

// ── Language filter (single-select) ─────────────────────────────────────────
export type LanguageCode = 'en' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'all'

export const LANGUAGE_OPTIONS: Record<LanguageCode, { label: string; code?: string }> = {
  en:  { label: '🇺🇸 Engels',     code: 'en' },
  fr:  { label: '🇫🇷 Frans',      code: 'fr' },
  de:  { label: '🇩🇪 Duits',      code: 'de' },
  es:  { label: '🇪🇸 Spaans',     code: 'es' },
  it:  { label: '🇮🇹 Italiaans',  code: 'it' },
  nl:  { label: '🇳🇱 Nederlands', code: 'nl' },
  all: { label: '🌐 Alle talen' },
}

export const ALL_LANGUAGE_CODES: LanguageCode[] = ['en', 'fr', 'de', 'es', 'it', 'nl', 'all']
