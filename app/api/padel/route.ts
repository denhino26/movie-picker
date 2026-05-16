import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://padelapi.org/api'
const TOKEN = process.env.PADEL_API_TOKEN ?? ''

// Only Premier Padel levels (lowercase as returned by API)
const PREMIER_LEVELS = ['major', 'p1', 'p2', 'finals']

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

/* eslint-disable @typescript-eslint/no-explicit-any */

// Normalize API match to our frontend format
function normalizeMatch(m: any, tournamentMap: Record<string, any>): any {
  const tournPath = m.connections?.tournament ?? ''
  const tournId = tournPath.split('/').pop()
  const tourn = tournamentMap[tournId]

  const team1Names = (m.players?.team_1 ?? []).map((p: any) => p.name).filter(Boolean)
  const team2Names = (m.players?.team_2 ?? []).map((p: any) => p.name).filter(Boolean)

  // Score: API returns array of {team_1: "6", team_2: "3"} or null
  const sets = Array.isArray(m.score)
    ? m.score.map((s: any) => ({ team1: parseInt(s.team_1) || 0, team2: parseInt(s.team_2) || 0 }))
    : []

  return {
    id: m.id,
    status: m.status === 'live' ? 'live' : m.status === 'finished' ? 'finished' : 'scheduled',
    played_at: m.played_at,
    round: m.round,
    round_name: m.round_name,
    category: m.category,
    court: m.court,
    schedule_label: m.schedule_label,
    name: m.name,
    winner: m.winner,
    tournament: tourn
      ? { name: tourn.name, level: tourn.level, location: tourn.location }
      : { name: 'Premier Padel', level: 'unknown', location: '' },
    teams: [
      { players: team1Names.map((n: string) => ({ name: n })) },
      { players: team2Names.map((n: string) => ({ name: n })) },
    ],
    score: { sets },
  }
}

function normalizeTourn(t: any): any {
  return {
    id: t.id,
    name: t.name,
    location: t.location,
    country: t.country,
    level: t.level,
    start_date: t.start_date,
    end_date: t.end_date,
    status: t.status === 'live' ? 'in_progress' : t.status,
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

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
        // For live we don't have tournament info from /live endpoint easily,
        // so we return all live matches (the /live endpoint is Premier-only if using Pro)
        const data = await padelFetch('/live')
        return NextResponse.json({ data: data.data ?? [] })
      }
      case 'matches': {
        // First fetch tournaments to build a lookup map
        const [matchData, tournData] = await Promise.all([
          padelFetch('/matches', {
            ...(category && { category }),
            ...(afterDate && { after_date: afterDate }),
            ...(beforeDate && { before_date: beforeDate }),
            sort_by: 'played_at',
            order_by: 'desc',
          }),
          padelFetch('/tournaments', {
            ...(afterDate && { after_date: afterDate }),
            ...(beforeDate && { before_date: beforeDate }),
          }),
        ])

        // Build tournament lookup (id -> tournament)
        const tournMap: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
        for (const t of (tournData.data ?? [])) {
          tournMap[String(t.id)] = t
        }

        // Filter matches: only those linked to Premier Padel tournaments
        const premierTournIds = new Set(
          Object.entries(tournMap)
            .filter(([, t]) => PREMIER_LEVELS.includes(t.level))
            .map(([id]) => id)
        )

        const matches = (matchData.data ?? [])
          .filter((m: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const tournPath = m.connections?.tournament ?? ''
            const tournId = tournPath.split('/').pop()
            return premierTournIds.has(tournId)
          })
          .map((m: any) => normalizeMatch(m, tournMap)) // eslint-disable-line @typescript-eslint/no-explicit-any

        return NextResponse.json({ data: matches })
      }
      case 'tournaments': {
        const params: Record<string, string> = {
          sort_by: 'start_date',
          order_by: 'asc',
        }
        if (afterDate) params.after_date = afterDate
        if (beforeDate) params.before_date = beforeDate

        const data = await padelFetch('/tournaments', params)

        const tournaments = (data.data ?? [])
          .filter((t: any) => PREMIER_LEVELS.includes(t.level)) // eslint-disable-line @typescript-eslint/no-explicit-any
          .map(normalizeTourn)

        return NextResponse.json({ data: tournaments })
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
  if (endpoint === 'live') return []
  if (endpoint === 'tournaments') {
    return [
      { id: 1, name: 'Kuwait P1 2026', location: 'Kuwait City', country: 'KW', level: 'p1', start_date: '2026-10-26', end_date: '2026-10-31', status: 'pending' },
      { id: 2, name: 'Dubai P1 2026', location: 'Dubai', country: 'AE', level: 'p1', start_date: '2026-11-09', end_date: '2026-11-15', status: 'pending' },
      { id: 3, name: 'Mexico Major 2026', location: 'Mexico City', country: 'MX', level: 'major', start_date: '2026-11-23', end_date: '2026-11-29', status: 'pending' },
      { id: 4, name: 'Barcelona Finals 2026', location: 'Barcelona', country: 'ES', level: 'finals', start_date: '2026-12-07', end_date: '2026-12-13', status: 'pending' },
    ]
  }
  return []
}
