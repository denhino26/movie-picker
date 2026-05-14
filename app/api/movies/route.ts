import { NextRequest, NextResponse } from 'next/server'
import { fetchFilms, fetchSeries } from '@/lib/tmdb'
import { GenreName, FILM_GENRES, SERIE_GENRES, Movie, YearRangeKey, computeDateRange } from '@/types/movie'

const ALL_KNOWN_GENRES = [...new Set([...FILM_GENRES, ...SERIE_GENRES])]

const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    overview: 'Twee gevangenismannen vormen een band over de jaren heen en vinden troost en uiteindelijke verlossing door daden van gewone fatsoenlijkheid.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 9.3,
    vote_count: 26000,
    release_date: '1994-09-23',
    genre_ids: [18],
  },
  {
    id: 2,
    title: 'Inception',
    overview: 'Een dief die de kunst beheerst om geheimen te stelen uit de onderbewuste geest van mensen terwijl ze dromen, krijgt de omgekeerde taak: een idee planten.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.8,
    vote_count: 35000,
    release_date: '2010-07-16',
    genre_ids: [28, 878, 53],
  },
  {
    id: 3,
    title: 'Train to Busan',
    overview: 'Terwijl een dodelijk virus uitbreekt in Zuid-Korea, moeten passagiers op een trein naar Busan overleven terwijl zombies hen aanvallen.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.6,
    vote_count: 8500,
    release_date: '2016-07-20',
    genre_ids: [27, 28, 53],
  },
  {
    id: 4,
    title: 'The Dark Knight',
    overview: 'Batman verheft zijn strijd tegen misdaad naar een nieuw niveau wanneer de Joker, een misdadiger die geniet van chaos, Gotham City terroriseert.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 9.0,
    vote_count: 31000,
    release_date: '2008-07-18',
    genre_ids: [28, 80, 18],
  },
  {
    id: 5,
    title: 'Get Out',
    overview: 'Een jonge Afro-Amerikaanse man bezoekt het landgoed van zijn vriendin en ontdekt een schokkend geheim dat zijn leven bedreigt.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.7,
    vote_count: 11000,
    release_date: '2017-02-24',
    genre_ids: [27, 53],
  },
  {
    id: 6,
    title: 'Interstellar',
    overview: 'Een team van verkenners reist door een wormgat in de ruimte in een poging om het voortbestaan van de mensheid te verzekeren.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.6,
    vote_count: 33000,
    release_date: '2014-11-07',
    genre_ids: [878, 18, 12],
  },
  {
    id: 7,
    title: 'Parasite',
    overview: 'Greed en klassendiscriminatie bedreigen de symbiotische relatie die ontstaat tussen de welgestelde Park-familie en de verarmde Kim-clan.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.5,
    vote_count: 17000,
    release_date: '2019-05-30',
    genre_ids: [35, 53, 18],
  },
  {
    id: 8,
    title: 'Breaking Bad (Serie)',
    name: 'Breaking Bad',
    overview: 'Een scheikundeleraar met kanker begint drugs te produceren om zijn familie financieel te verzorgen.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 9.5,
    vote_count: 15000,
    first_air_date: '2008-01-20',
    genre_ids: [80, 18],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genreParam     = searchParams.get('genres') ?? ''
  const pageParam      = searchParams.get('page') ?? '1'
  const type           = searchParams.get('type') === 'serie' ? 'serie' : 'film'
  const language       = searchParams.get('language') ?? 'en'
  const yearRangesRaw  = (searchParams.get('yearRanges') ?? '').split(',').filter(Boolean) as YearRangeKey[]
  const dateRange      = computeDateRange(yearRangesRaw)

  const rawGenres = genreParam.split(',').filter(Boolean)
  const genres = rawGenres.filter((g): g is GenreName =>
    ALL_KNOWN_GENRES.includes(g as GenreName)
  )

  if (!process.env.TMDB_ACCESS_TOKEN) {
    return NextResponse.json({ results: MOCK_MOVIES, page: 1, total_pages: 1, total_results: MOCK_MOVIES.length })
  }

  try {
    const data = type === 'serie'
      ? await fetchSeries(genres, Number(pageParam), dateRange, language)
      : await fetchFilms(genres, Number(pageParam), dateRange, language)
    return NextResponse.json(data)
  } catch (err) {
    console.error('TMDB fetch failed:', err)
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 502 })
  }
}
