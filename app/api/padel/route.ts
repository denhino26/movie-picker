import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://padelapi.org/api'
const TOKEN = process.env.PADEL_API_TOKEN ?? ''

// Only Premier Padel levels
const PREMIER_LEVELS = ['Major', 'P1', 'P2']

async function padelFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v)
    })
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json',
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`PadelAPI ${res.status}: ${res.statusText}`)
  }

  return res.json()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') ?? 'matches'
  const category = searchParams.get('category') ?? ''
  const afterDate = searchParams.get('after_date') ?? ''
  const beforeDate = searchParams.get('before_date') ?? ''

  if (!TOKEN) {
    return NextResponse.json(
      { error: 'PADEL_API_TOKEN not configured', mock: true, data: getMockData(endpoint) },
      { status: 200 }
    )
  }

  try {
    switch (endpoint) {
      case 'live': {
        const data = await padelFetch('/live')
        // Filter live matches to Premier Padel only
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.filter((m: { tournament?: { level?: string } }) =>
            m.tournament?.level && PREMIER_LEVELS.includes(m.tournament.level)
          )
        }
        return NextResponse.json(data)
      }
      case 'matches': {
        const params: Record<string, string> = {}
        if (category) params.category = category
        if (afterDate) params.after_date = afterDate
        if (beforeDate) params.before_date = beforeDate
        params.sort_by = 'played_at'
        params.order_by = 'desc'
        const data = await padelFetch('/matches', params)
        // Filter matches to Premier Padel only
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.filter((m: { tournament?: { level?: string } }) =>
            m.tournament?.level && PREMIER_LEVELS.includes(m.tournament.level)
          )
        }
        return NextResponse.json(data)
      }
      case 'tournaments': {
        const params: Record<string, string> = {}
        if (afterDate) params.after_date = afterDate
        if (beforeDate) params.before_date = beforeDate
        params.sort_by = 'start_date'
        params.order_by = 'desc'
        const data = await padelFetch('/tournaments', params)
        // Filter tournaments to Premier Padel only
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.filter((t: { level?: string }) =>
            t.level && PREMIER_LEVELS.includes(t.level)
          )
        }
        return NextResponse.json(data)
      }
      default:
        return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 })
    }
  } catch (err) {
    console.error('PadelAPI error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch padel data', data: getMockData(endpoint) },
      { status: 502 }
    )
  }
}

function getMockData(endpoint: string) {
  if (endpoint === 'live') {
    return []
  }

  if (endpoint === 'tournaments') {
    return [
      {
        id: 1,
        name: 'Premier Padel Major — Madrid',
        location: 'Madrid, Spain',
        level: 'Major',
        start_date: '2026-05-12',
        end_date: '2026-05-18',
        status: 'in_progress',
        category: 'men',
      },
      {
        id: 2,
        name: 'Premier Padel P1 — Milano',
        location: 'Milano, Italy',
        level: 'P1',
        start_date: '2026-05-19',
        end_date: '2026-05-25',
        status: 'upcoming',
        category: 'men',
      },
      {
        id: 3,
        name: 'Premier Padel P2 — Amsterdam',
        location: 'Amsterdam, Netherlands',
        level: 'P2',
        start_date: '2026-06-02',
        end_date: '2026-06-08',
        status: 'upcoming',
        category: 'men',
      },
    ]
  }

  // matches
  return [
    {
      id: 101,
      status: 'live',
      played_at: new Date().toISOString(),
      round: 8,
      category: 'men',
      tournament: { name: 'Premier Padel Major — Madrid', level: 'Major' },
      teams: [
        { players: [{ name: 'Arturo Coello' }, { name: 'Agustín Tapia' }] },
        { players: [{ name: 'Alejandro Galán' }, { name: 'Federico Chingotto' }] },
      ],
      score: {
        sets: [
          { team1: 6, team2: 4 },
          { team1: 3, team2: 6 },
          { team1: 2, team2: 1 },
        ],
      },
    },
    {
      id: 102,
      status: 'live',
      played_at: new Date().toISOString(),
      round: 8,
      category: 'women',
      tournament: { name: 'Premier Padel Major — Madrid', level: 'Major' },
      teams: [
        { players: [{ name: 'Ariana Sánchez' }, { name: 'Paula Josemaría' }] },
        { players: [{ name: 'Gemma Triay' }, { name: 'Claudia Fernández' }] },
      ],
      score: {
        sets: [
          { team1: 7, team2: 5 },
          { team1: 4, team2: 4 },
        ],
      },
    },
    {
      id: 103,
      status: 'finished',
      played_at: new Date(Date.now() - 3600000).toISOString(),
      round: 16,
      category: 'men',
      tournament: { name: 'Premier Padel Major — Madrid', level: 'Major' },
      teams: [
        { players: [{ name: 'Juan Lebrón' }, { name: 'Paquito Navarro' }] },
        { players: [{ name: 'Martín Di Nenno' }, { name: 'Franco Stupaczuk' }] },
      ],
      score: {
        sets: [
          { team1: 6, team2: 3 },
          { team1: 6, team2: 4 },
        ],
      },
    },
    {
      id: 104,
      status: 'scheduled',
      played_at: new Date(Date.now() + 7200000).toISOString(),
      round: 8,
      category: 'men',
      tournament: { name: 'Premier Padel Major — Madrid', level: 'Major' },
      teams: [
        { players: [{ name: 'Fernando Belasteguín' }, { name: 'Sanyo Gutiérrez' }] },
        { players: [{ name: 'Ale Galán' }, { name: 'Juan Cruz Belluati' }] },
      ],
      score: { sets: [] },
    },
  ]
}
