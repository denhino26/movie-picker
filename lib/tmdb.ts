import { GenreName, FILM_GENRE_MAP, SERIE_GENRE_MAP, TMDBResponse, ZOMBIE_KEYWORD_ID } from '@/types/movie'

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
  language?: string
): string {
  const genreIds       = [...new Set(genres.flatMap((g) => FILM_GENRE_MAP[g] ?? []))]
  const includesZombie = genres.includes('zombie')
  const includesAdult  = genres.includes('18+')

  const params = new URLSearchParams({
    language:         'nl-NL',
    sort_by:          'vote_average.desc',
    'vote_count.gte': '100',
    include_adult:    includesAdult ? 'true' : 'false',
    page:             String(page),
  })

  if (genreIds.length > 0)  params.set('with_genres', genreIds.join(','))
  if (includesZombie)       params.set('with_keywords', String(ZOMBIE_KEYWORD_ID))
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
  language?: string
): string {
  const genreIds      = [...new Set(genres.flatMap((g) => SERIE_GENRE_MAP[g] ?? []))]
  const includesAdult = genres.includes('18+')

  const params = new URLSearchParams({
    language:         'nl-NL',
    sort_by:          'vote_average.desc',
    'vote_count.gte': '50',
    include_adult:    includesAdult ? 'true' : 'false',
    page:             String(page),
  })

  if (genreIds.length > 0)  params.set('with_genres', genreIds.join(','))
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
  language?: string
): Promise<TMDBResponse> {
  const url = buildFilmUrl(genres, page, dateRange, language)
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB films error: ${res.status}`)
  return res.json() as Promise<TMDBResponse>
}

export async function fetchSeries(
  genres: GenreName[],
  page = 1,
  dateRange?: DateRange,
  language?: string
): Promise<TMDBResponse> {
  const url = buildSerieUrl(genres, page, dateRange, language)
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB series error: ${res.status}`)
  return res.json() as Promise<TMDBResponse>
}
