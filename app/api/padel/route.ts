import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://padelapi.org/api'
const TOKEN = process.env.PADEL_API_TOKEN ?? ''
const PREMIER_SEASON_ID = '5' // Premier Padel 2026

/* eslint-disable @typescript-eslint/no-explicit-any */

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

// Build tournament lookup from the Premier Padel season
async function getPremierTournaments(): Promise<Record<string, any>> {
  const data = await padelFetch(`/seasons/${PREMIER_SEASON_ID}/tournaments`)
  const map: Record<string, any> = {}
  for (const t of (data.data ?? [])) {
    map[String(t.id)] = t
  }
  return map
}

// Normalize API match to our frontend format
function normalizeMatch(m: any, tournMap: Record<string, any>): any {
  const tournPath = m.connections?.tournament ?? ''
  const tournId = tournPath.split('/').pop()
  const tourn = tournMap[tournId]

  const team1Names = (m.players?.team_1 ?? []).map((p: any) => p.name).filter(Boolean)
  const team2Names = (m.players?.team_2 ?? []).map((p: any) => p.name).filter(Boolean)

  const sets = Array.isArray(m.score)
    ? m.score.map((s: any) => ({ team1: parseInt(s.team_1) || 0, team2: parseInt(s.team_2) || 0 }))
    : []

  return {
    id: m.id,
    status: m.status === 'live' ? 'live' : m.status === 'finished' ? 'finished' : 'scheduled',
    played_at: m.played_at,
    started_time: m.started_time,
    round: m.round,
    round_name: m.round_name,
    category: m.category,
    court: m.court,
    schedule_label: m.schedule_label,
    name: m.name,
    winner: m.winner,
    tournament: tourn
      ? { name: tourn.name, level: tourn.level, location: tourn.location, country: tourn.country }
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') ?? 'matches'
  const afterDate = searchParams.get('after_date') ?? ''
  const beforeDate = searchParams.get('before_date') ?? ''

  if (!TOKEN) {
    return NextResponse.json(
      { error: 'PADEL_API_TOKEN not configured', mock: true, data: getMockData(endpoint) },
      { status: 200 }
    )
  }

  try {
    // Always load premier tournaments for reference
    const tournMap = await getPremierTournaments()
    const premierTournIds = new Set(Object.keys(tournMap))

    switch (endpoint) {
      case 'live': {
        const data = await padelFetch('/live')
        // Live endpoint returns different structure — just pass through for now
        return NextResponse.json({ data: data.data ?? [] })
      }
      case 'matches': {
        const params: Record<string, string> = {
          sort_by: 'played_at',
          order_by: 'desc',
        }
        if (afterDate) params.after_date = afterDate
        if (beforeDate) params.before_date = beforeDate

        const matchData = await padelFetch('/matches', params)

        const matches = (matchData.data ?? [])
          .filter((m: any) => {
            const tournPath = m.connections?.tournament ?? ''
            const tournId = tournPath.split('/').pop()
            return premierTournIds.has(tournId)
          })
          .map((m: any) => normalizeMatch(m, tournMap))

        return NextResponse.json({ data: matches })
      }
      case 'tournaments': {
        // Return all Premier Padel season tournaments, sorted by date
        const tourns = Object.values(tournMap)
          .map(normalizeTourn)
          .sort((a: any, b: any) => a.start_date.localeCompare(b.start_date))

        return NextResponse.json({ data: tourns })
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

/* eslint-enable @typescript-eslint/no-explicit-any */

function getMockData(endpoint: string) {
  if (endpoint === 'live') return []
  if (endpoint === 'tournaments') {
    return [
      { id: 732, name: 'Buenos Aires P1 2026', location: 'Buenos Aires', country: 'AR', level: 'p1', start_date: '2026-05-11', end_date: '2026-05-17', status: 'in_progress' },
      { id: 734, name: 'Italy Major 2026', location: 'Rome', country: 'IT', level: 'major', start_date: '2026-06-01', end_date: '2026-06-07', status: 'pending' },
      { id: 735, name: 'Valencia P1 2026', location: 'Valencia', country: 'ES', level: 'p1', start_date: '2026-06-08', end_date: '2026-06-14', status: 'pending' },
    ]
  }
  return []
}
