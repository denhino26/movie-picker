import { GenreName, FILM_GENRE_MAP, SERIE_GENRE_MAP, TMDBResponse, ZOMBIE_KEYWORD_ID, EROTIC_KEYWORD_ID } from '@/types/movie'

const BASE_URL = 'https://api.themoviedb.org/3'

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    Accept: 'application/json',
  }
}

interface DateRange { gte?: string; lte?: string }

export function buildFilmUrl(
  genres: GenreName[],
  page = 1,
  dateRange?: DateRange,
  language?: string,
  sortMode: 'rating' | 'new' | 'popular' = 'rating'
): string {
  const genreIds       = Array.from(new Set(genres.flatMap((g) => FILM_GENRE_MAP[g] ?? [])))
  const includesZombie = genres.includes('zombie')
  const includesSexy   = genres.includes('sexy')
  const includesAdult  = genres.includes('18+') || includesSexy

  const sortBy = sortMode === 'new' ? 'primary_release_date.desc'
    : sortMode === 'popular' ? 'popularity.desc'
    : 'vote_average.desc'
  const minVotes = sortMode === 'new' ? '10' : sortMode === 'popular' ? '50' : '100'

  const params = new URLSearchParams({
    language:         'nl-NL',
    sort_by:          sortBy,
    'vote_count.gte': minVotes,
    include_adult:    includesAdult ? 'true' : 'false',
    page:             String(page),
  })

  if (genreIds.length > 0)  params.set('with_genres', genreIds.join(','))
  const keywords: number[] = []
  if (includesZombie)       keywords.push(ZOMBIE_KEYWORD_ID)
  if (includesSexy)         keywords.push(EROTIC_KEYWORD_ID)
  if (keywords.length > 0)  params.set('with_keywords', keywords.join(','))
  if (includesAdult) {
    params.set('certification_country', 'US')
    params.set('certification.gte',     'R')
  }
  if (dateRange?.gte)       params.set('primary_release_date.gte', dateRange.gte)
  if (dateRange?.lte)       params.set('primary_release_date.lte', dateRange.lte)
  if (language && language !== 'all') params.set('with_original_language', language)

  return `${BASE_URL}/discover/movie?${params.toString()}`
}

export function buildSerieUrl(
  genres: GenreName[],
  page = 1,
  dateRange?: DateRange,
  language?: string,
  sortMode: 'rating' | 'new' | 'popular' = 'rating'
): string {
  const genreIds      = Array.from(new Set(genres.flatMap((g) => SERIE_GENRE_MAP[g] ?? [])))
  const includesSexy  = genres.includes('sexy')
  const includesAdult = genres.includes('18+') || includesSexy

  const sortBy = sortMode === 'new' ? 'first_air_date.desc'
    : sortMode === 'popular' ? 'popularity.desc'
    : 'vote_average.desc'
  const minVotes = sortMode === 'new' ? '5' : sortMode === 'popular' ? '20' : '50'

  const params = new URLSearchParams({
    language:         'nl-NL',
    sort_by:          sortBy,
    'vote_count.gte': minVotes,
    include_adult:    includesAdult ? 'true' : 'false',
    page:             String(page),
  })

  if (genreIds.length > 0)  params.set('with_genres', genreIds.join(','))
  if (includesSexy)         params.set('with_keywords', String(EROTIC_KEYWORD_ID))
  if (includesAdult) {
    params.set('certification_country', 'US')
    params.set('certification.gte',     'TV-MA')
  }
  if (dateRange?.gte)       params.set('first_air_date.gte', dateRange.gte)
  if (dateRange?.lte)       params.set('first_air_date.lte', dateRange.lte)
  if (language && language !== 'all') params.set('with_original_language', language)

  return `${BASE_URL}/discover/tv?${params.toString()}`
}

export async function fetchFilms(
  genres: GenreName[],
  page = 1,
  dateRange?: DateRange,
  language?: string,
  sortMode: 'rating' | 'new' | 'popular' = 'rating'
): Promise<TMDBResponse> {
  const url = buildFilmUrl(genres, page, dateRange, language, sortMode)
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB films error: ${res.status}`)
  return res.json() as Promise<TMDBResponse>
}

export async function fetchSeries(
  genres: GenreName[],
  page = 1,
  dateRange?: DateRange,
  language?: string,
  sortMode: 'rating' | 'new' | 'popular' = 'rating'
): Promise<TMDBResponse> {
  const url = buildSerieUrl(genres, page, dateRange, language, sortMode)
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB series error: ${res.status}`)
  return res.json() as Promise<TMDBResponse>
}
