'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RefreshCw, ArrowLeft, Trophy } from 'lucide-react'

interface Player {
  name: string
}
interface Team {
  players: Player[]
}
interface SetScore {
  team1: number
  team2: number
}
interface Match {
  id: number
  status: 'live' | 'finished' | 'scheduled' | string
  played_at: string
  started_time?: string
  round: number
  round_name?: string
  category: 'men' | 'women' | string
  court?: string
  schedule_label?: string
  name?: string
  winner?: string
  tournament: { name: string; level: string; location?: string }
  teams: Team[]
  score: { sets: SetScore[] }
}
interface Tournament {
  id: number
  name: string
  location: string
  country?: string
  level: string
  start_date: string
  end_date: string
  status: string
}

type Tab = 'programma' | 'kalender'

const LEVEL_LABELS: Record<string, string> = {
  major: 'Major',
  p1: 'P1',
  p2: 'P2',
  finals: 'Finals',
}

const DAY_NAMES: Record<string, string> = {
  'monday': 'Maandag',
  'tuesday': 'Dinsdag',
  'wednesday': 'Woensdag',
  'thursday': 'Donderdag',
  'friday': 'Vrijdag',
  'saturday': 'Zaterdag',
  'sunday': 'Zondag',
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })
  } catch { return dateStr }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'Europe/Amsterdam' })
  } catch { return dateStr }
}

function translateScheduleLabel(label: string): string {
  // "Not before 3:00 PM" → "Vanaf 15:00"
  // "Starting at 1:00 PM" → "Start 13:00"
  const notBefore = label.match(/Not before (\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (notBefore) {
    let h = parseInt(notBefore[1])
    if (notBefore[3].toUpperCase() === 'PM' && h !== 12) h += 12
    if (notBefore[3].toUpperCase() === 'AM' && h === 12) h = 0
    return `Vanaf ${String(h).padStart(2, '0')}:${notBefore[2]}`
  }
  const startingAt = label.match(/Starting at (\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (startingAt) {
    let h = parseInt(startingAt[1])
    if (startingAt[3].toUpperCase() === 'PM' && h !== 12) h += 12
    if (startingAt[3].toUpperCase() === 'AM' && h === 12) h = 0
    return `Start ${String(h).padStart(2, '0')}:${startingAt[2]}`
  }
  return label
}

function formatDayLabel(dateStr: string, today: string, tomorrow: string): string {
  if (dateStr === today) return 'Vandaag'
  if (dateStr === tomorrow) return 'Morgen'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    const dayEn = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Europe/Amsterdam' }).toLowerCase()
    const dayNl = DAY_NAMES[dayEn] ?? dayEn
    return `${dayNl} ${formatDate(dateStr)}`
  } catch { return formatDate(dateStr) }
}

function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  // First name initial + last name
  const last = parts[parts.length - 1]
  return `${parts[0][0]}. ${last}`
}

function MatchCard({ match }: { match: Match }) {
  const team1Players = match.teams?.[0]?.players ?? []
  const team2Players = match.teams?.[1]?.players ?? []
  const team1 = team1Players.length > 0 ? team1Players.map(p => shortName(p.name)).join(' / ') : 'TBD'
  const team2 = team2Players.length > 0 ? team2Players.map(p => shortName(p.name)).join(' / ') : 'TBD'
  const sets = match.score?.sets ?? []
  const isLive = match.status === 'live'
  const isScheduled = match.status === 'scheduled'
  const isFinished = match.status === 'finished'
  const roundText = match.round_name ?? `Ronde ${match.round}`
  const isWomen = match.category === 'women'

  // Time display
  let timeLabel = ''
  if (match.schedule_label) {
    timeLabel = translateScheduleLabel(match.schedule_label)
  } else if (match.started_time) {
    timeLabel = formatTime(match.started_time)
  }

  return (
    <div className={`bg-cinema-card rounded-xl border p-3 transition-all duration-200 ${
      isLive ? 'border-red-500/40' : 'border-white/5'
    }`}>
      {/* Top row: category + round + time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium ${isWomen ? 'text-pink-400' : 'text-sky-400'}`}>
            {isWomen ? '♀ Dames' : '♂ Heren'}
          </span>
          <span className="text-[11px] text-cinema-muted">·</span>
          <span className="text-[11px] text-cinema-muted">{roundText}</span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="text-[11px] text-red-400 font-medium animate-pulse">● LIVE</span>
          )}
          {timeLabel && (
            <span className={`text-[11px] font-medium ${isScheduled ? 'text-emerald-400' : 'text-cinema-muted'}`}>
              {timeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Teams + scores */}
      <div className="space-y-1.5">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            match.winner === 'team_1' ? 'text-emerald-400' : isFinished && match.winner === 'team_2' ? 'text-cinema-muted' : 'text-white'
          }`}>
            {team1}
          </span>
          <div className="flex gap-2 ml-3">
            {sets.map((s, i) => (
              <span key={i} className={`w-6 text-center text-sm font-mono font-bold ${
                s.team1 > s.team2 ? 'text-emerald-400' : 'text-cinema-muted'
              }`}>
                {s.team1}
              </span>
            ))}
            {sets.length === 0 && !isScheduled && <span className="text-cinema-muted text-xs">—</span>}
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            match.winner === 'team_2' ? 'text-emerald-400' : isFinished && match.winner === 'team_1' ? 'text-cinema-muted' : 'text-white'
          }`}>
            {team2}
          </span>
          <div className="flex gap-2 ml-3">
            {sets.map((s, i) => (
              <span key={i} className={`w-6 text-center text-sm font-mono font-bold ${
                s.team2 > s.team1 ? 'text-emerald-400' : 'text-cinema-muted'
              }`}>
                {s.team2}
              </span>
            ))}
            {sets.length === 0 && !isScheduled && <span className="text-cinema-muted text-xs">—</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

const LEVEL_COLORS: Record<string, string> = {
  major: 'bg-amber-600/30 text-amber-300 border-amber-500/40',
  p1: 'bg-sky-600/30 text-sky-300 border-sky-500/40',
  p2: 'bg-violet-600/30 text-violet-300 border-violet-500/40',
  finals: 'bg-red-600/30 text-red-300 border-red-500/40',
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const isActive = tournament.status === 'in_progress' || tournament.status === 'live'
  const levelLabel = LEVEL_LABELS[tournament.level] ?? tournament.level
  const levelColor = LEVEL_COLORS[tournament.level] ?? 'bg-white/10 text-cinema-muted border-white/10'
  return (
    <div className={`bg-cinema-card rounded-xl border p-4 space-y-2 ${
      isActive ? 'border-emerald-500/40' : 'border-white/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${levelColor}`}>
            {levelLabel}
          </span>
          <span className="text-sm font-bold text-white">{tournament.name}</span>
        </div>
        {isActive && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 animate-pulse">
            Nu bezig
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-cinema-muted">
        <span>📍 {tournament.location}{tournament.country ? ` (${tournament.country})` : ''}</span>
      </div>
      <div className="text-xs text-cinema-muted">
        📅 {formatDate(tournament.start_date)} – {formatDate(tournament.end_date)}
      </div>
    </div>
  )
}

export default function PadelPage() {
  const [tab, setTab] = useState<Tab>('programma')
  const [matches, setMatches] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      // Fetch matches from today + 7 days ahead to show upcoming rounds (e.g. finals)
      const weekAhead = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]

      const [matchRes, tournRes] = await Promise.all([
        fetch(`/api/padel?endpoint=matches&after_date=${today}&before_date=${weekAhead}`),
        fetch(`/api/padel?endpoint=tournaments`),
      ])

      const matchData = await matchRes.json()
      const tournData = await tournRes.json()

      setMatches(Array.isArray(matchData.data) ? matchData.data : [])
      setTournaments(Array.isArray(tournData.data) ? tournData.data : [])
      setIsMock(!!matchData.mock || !!tournData.mock)
      setLastRefresh(new Date())
    } catch {
      setMatches([])
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Group matches by date
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0]

  const matchesByDate = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const date = m.played_at?.split('T')[0] ?? today
    if (!acc[date]) acc[date] = []
    acc[date].push(m)
    return acc
  }, {})

  const sortedDates = Object.keys(matchesByDate).sort()

  const liveCount = matches.filter(m => m.status === 'live').length
  const activeTournament = tournaments.find(t => t.status === 'in_progress')
  // Only show active + upcoming tournaments in kalender
  const upcomingTournaments = tournaments.filter(t => t.status !== 'finished')

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'programma', label: '📅 Programma', count: liveCount > 0 ? liveCount : undefined },
    { key: 'kalender', label: '🏆 Kalender', count: upcomingTournaments.length },
  ]

  return (
    <main className="min-h-screen bg-gradient-cinema px-4 py-6 sm:py-8">
      <div className="max-w-lg sm:max-w-2xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="text-center space-y-1 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cinema-muted hover:text-white text-sm transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Terug
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            🏸 Premier Padel
          </h1>
          <p className="text-cinema-muted text-sm">
            Programma &amp; uitslagen
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cinema-surface rounded-xl p-1">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${tab === key
                  ? 'bg-cinema-card text-white shadow-md'
                  : 'text-cinema-muted hover:text-white'
                }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  key === 'programma' && liveCount > 0 ? 'bg-red-600 text-white' : 'bg-white/10 text-cinema-muted'
                }`}>
                  {key === 'programma' && liveCount > 0 ? `${liveCount} live` : count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh bar */}
        <div className="flex items-center justify-between text-xs text-cinema-muted">
          <span>
            Bijgewerkt: {lastRefresh.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })}
            {isMock && ' (demo data)'}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1 text-cinema-muted hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Vernieuwen
          </button>
        </div>

        {/* Loading */}
        {loading && matches.length === 0 && tournaments.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-cinema-card" />
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🏸</div>
            </div>
            <p className="text-cinema-text text-lg font-medium animate-pulse">
              Premier Padel laden...
            </p>
          </div>
        )}

        {/* Programma tab */}
        {!loading && tab === 'programma' && (
          <div className="space-y-3 animate-fade-in">
            {activeTournament && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
                <Trophy size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm text-emerald-300 font-medium">{activeTournament.name}</span>
                <span className="text-xs text-cinema-muted ml-auto">📍 {activeTournament.location}</span>
              </div>
            )}

            {matches.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-5xl">📅</div>
                <h3 className="text-lg font-semibold text-white">Geen wedstrijden gepland</h3>
                <p className="text-cinema-muted text-sm">
                  {activeTournament
                    ? 'Er staan geen wedstrijden gepland voor de komende dagen.'
                    : 'Er is momenteel geen Premier Padel toernooi bezig.'
                  }
                </p>
                {!activeTournament && tournaments.length > 0 && (
                  <button
                    onClick={() => setTab('kalender')}
                    className="mt-4 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm
                               transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40"
                  >
                    Bekijk kalender →
                  </button>
                )}
              </div>
            ) : (
              sortedDates.map((date) => {
                const dayMatches = matchesByDate[date]
                const finished = dayMatches.filter(m => m.status === 'finished')
                const live = dayMatches.filter(m => m.status === 'live')
                const scheduled = dayMatches.filter(m => m.status === 'scheduled')
                const dayLabel = formatDayLabel(date, today, tomorrow)
                const isToday = date === today

                return (
                  <div key={date} className="space-y-3">
                    {/* Day header */}
                    <div className={`flex items-center gap-2 pt-2 ${sortedDates.indexOf(date) > 0 ? 'border-t border-white/10 mt-2' : ''}`}>
                      <h3 className={`text-sm font-bold ${isToday ? 'text-white' : 'text-cinema-muted'}`}>
                        {dayLabel}
                      </h3>
                      {live.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 animate-pulse">
                          {live.length} live
                        </span>
                      )}
                      <span className="text-xs text-cinema-muted ml-auto">
                        {dayMatches.length} wedstrijd{dayMatches.length !== 1 ? 'en' : ''}
                      </span>
                    </div>

                    {/* Finished */}
                    {finished.length > 0 && (
                      <>
                        <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">
                          ✅ Gespeeld ({finished.length})
                        </p>
                        {finished.map(m => <MatchCard key={m.id} match={m} />)}
                      </>
                    )}

                    {/* Live */}
                    {live.length > 0 && (
                      <>
                        {finished.length > 0 && <div className="border-t border-white/5" />}
                        <p className="text-xs font-medium text-red-400 uppercase tracking-wider">
                          🔴 Nu live ({live.length})
                        </p>
                        {live.map(m => <MatchCard key={m.id} match={m} />)}
                      </>
                    )}

                    {/* Scheduled */}
                    {scheduled.length > 0 && (
                      <>
                        {(finished.length > 0 || live.length > 0) && <div className="border-t border-white/5" />}
                        <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                          ⏰ {isToday ? 'Komt nog' : 'Gepland'} ({scheduled.length})
                        </p>
                        {scheduled.map(m => <MatchCard key={m.id} match={m} />)}
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Kalender tab */}
        {!loading && tab === 'kalender' && (
          <div className="space-y-3 animate-fade-in">
            {upcomingTournaments.length > 0 ? (
              upcomingTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="text-5xl">🏆</div>
                <h3 className="text-lg font-semibold text-white">Geen toernooien gevonden</h3>
                <p className="text-cinema-muted text-sm">
                  Er zijn geen komende Premier Padel toernooien gevonden.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
