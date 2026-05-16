'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { RefreshCw, ArrowLeft, Trophy, Clock, CheckCircle, Radio } from 'lucide-react'

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

type Tab = 'live' | 'schedule' | 'tournaments'

const LEVEL_LABELS: Record<string, string> = {
  major: 'Major',
  p1: 'P1',
  p2: 'P2',
  finals: 'Finals',
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  } catch { return dateStr }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  } catch { return dateStr }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 animate-pulse">
        <Radio size={10} /> LIVE
      </span>
    )
  }
  if (status === 'finished') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cinema-surface text-cinema-muted border border-white/10">
        <CheckCircle size={10} /> Afgelopen
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-700/30">
      <Clock size={10} /> Gepland
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const isWomen = category === 'women'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${
      isWomen
        ? 'bg-pink-900/30 text-pink-300 border-pink-700/30'
        : 'bg-sky-900/30 text-sky-300 border-sky-700/30'
    }`}>
      {isWomen ? '♀ Dames' : '♂ Heren'}
    </span>
  )
}

function MatchCard({ match }: { match: Match }) {
  const team1Players = match.teams?.[0]?.players ?? []
  const team2Players = match.teams?.[1]?.players ?? []
  const team1 = team1Players.length > 0 ? team1Players.map(p => p.name).join(' / ') : 'TBD'
  const team2 = team2Players.length > 0 ? team2Players.map(p => p.name).join(' / ') : 'TBD'
  const sets = match.score?.sets ?? []
  const isLive = match.status === 'live'
  const roundText = match.round_name ?? `Ronde ${match.round}`

  // Calculate how long the match has been going
  let durationText = ''
  if (isLive && match.started_time) {
    const startMs = new Date(match.started_time).getTime()
    const nowMs = Date.now()
    const diffMin = Math.round((nowMs - startMs) / 60000)
    if (diffMin > 0 && diffMin < 600) {
      const hrs = Math.floor(diffMin / 60)
      const mins = diffMin % 60
      durationText = hrs > 0 ? `${hrs}u ${mins}m` : `${mins}m`
    }
  }

  return (
    <div className={`bg-cinema-card rounded-xl border p-4 space-y-3 transition-all duration-200 ${
      isLive ? 'border-red-500/40 shadow-lg shadow-red-900/10' : 'border-white/5'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={match.status} />
          <CategoryBadge category={match.category} />
          <span className="text-xs text-cinema-muted">{roundText}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-cinema-muted">
          {isLive && durationText && (
            <span className="text-red-400">⏱ {durationText}</span>
          )}
          {match.schedule_label ? (
            <span>{match.schedule_label}</span>
          ) : match.started_time ? (
            <span>{formatTime(match.started_time)}</span>
          ) : match.played_at?.includes('T') ? (
            <span>{formatTime(match.played_at)}</span>
          ) : null}
        </div>
      </div>

      {/* Tournament */}
      <div className="flex items-center gap-1.5">
        <Trophy size={12} className="text-amber-400 shrink-0" />
        <span className="text-xs text-amber-400 truncate">{match.tournament?.name}</span>
        {match.court && (
          <span className="text-xs text-cinema-muted ml-auto shrink-0">📍 {match.court}</span>
        )}
      </div>

      {/* Score board */}
      <div className="bg-cinema-surface rounded-lg p-3 space-y-2">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium flex-1 truncate mr-3 ${
            match.winner === 'team_1' ? 'text-emerald-400' : isLive ? 'text-white' : 'text-cinema-text'
          }`}>
            {team1}
          </span>
          <div className="flex gap-2">
            {sets.map((s, i) => (
              <span key={i} className={`w-7 text-center text-sm font-mono font-bold ${
                s.team1 > s.team2 ? 'text-emerald-400' : 'text-cinema-muted'
              }`}>
                {s.team1}
              </span>
            ))}
            {sets.length === 0 && isLive && (
              <span className="text-red-400/60 text-xs italic">bezig</span>
            )}
            {sets.length === 0 && !isLive && <span className="text-cinema-muted text-sm">—</span>}
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium flex-1 truncate mr-3 ${
            match.winner === 'team_2' ? 'text-emerald-400' : isLive ? 'text-white' : 'text-cinema-text'
          }`}>
            {team2}
          </span>
          <div className="flex gap-2">
            {sets.map((s, i) => (
              <span key={i} className={`w-7 text-center text-sm font-mono font-bold ${
                s.team2 > s.team1 ? 'text-emerald-400' : 'text-cinema-muted'
              }`}>
                {s.team2}
              </span>
            ))}
            {sets.length === 0 && isLive && (
              <span className="text-red-400/60 text-xs italic">bezig</span>
            )}
            {sets.length === 0 && !isLive && <span className="text-cinema-muted text-sm">—</span>}
          </div>
        </div>
      </div>

      {/* Live score note */}
      {isLive && sets.length === 0 && (
        <p className="text-[10px] text-cinema-muted text-center italic">
          Live scores zijn beperkt beschikbaar via de API
        </p>
      )}
    </div>
  )
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const isActive = tournament.status === 'in_progress' || tournament.status === 'live'
  const levelLabel = LEVEL_LABELS[tournament.level] ?? tournament.level
  return (
    <div className={`bg-cinema-card rounded-xl border p-4 space-y-2 ${
      isActive ? 'border-emerald-500/40' : 'border-white/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={14} className={isActive ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="text-sm font-bold text-white">{tournament.name}</span>
        </div>
        {isActive && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
            Nu bezig
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-cinema-muted">
        <span>📍 {tournament.location}{tournament.country ? ` (${tournament.country})` : ''}</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-300 border border-amber-700/20">
          {levelLabel}
        </span>
      </div>
      <div className="text-xs text-cinema-muted">
        📅 {formatDate(tournament.start_date)} – {formatDate(tournament.end_date)}
      </div>
    </div>
  )
}

export default function PadelPage() {
  const [tab, setTab] = useState<Tab>('live')
  const [matches, setMatches] = useState<Match[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const [matchRes, tournRes] = await Promise.all([
        fetch(`/api/padel?endpoint=matches&after_date=${today}&before_date=${today}`),
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

  const liveMatches = matches.filter(m => m.status === 'live')
  const scheduledMatches = matches.filter(m => m.status === 'scheduled')
  const finishedMatches = matches.filter(m => m.status === 'finished')
  const upcomingMatches = [...scheduledMatches].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  )

  const noMatchesAtAll = matches.length === 0 && !loading
  const activeTournament = tournaments.find(t => t.status === 'in_progress')

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'live', label: '🔴 Live', count: liveMatches.length },
    { key: 'schedule', label: '📅 Vandaag', count: matches.length },
    { key: 'tournaments', label: '🏆 Kalender', count: tournaments.length },
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
            Live standen &amp; programma
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
                  key === 'live' && count > 0 ? 'bg-red-600 text-white' : 'bg-white/10 text-cinema-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh bar */}
        <div className="flex items-center justify-between text-xs text-cinema-muted">
          <span>
            Bijgewerkt: {lastRefresh.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
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

        {/* Live tab */}
        {!loading && tab === 'live' && (
          <div className="space-y-3 animate-fade-in">
            {activeTournament && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
                <Trophy size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm text-emerald-300 font-medium">{activeTournament.name}</span>
                <span className="text-xs text-cinema-muted ml-auto">📍 {activeTournament.location}</span>
              </div>
            )}
            {liveMatches.length > 0 ? (
              liveMatches.map(m => <MatchCard key={m.id} match={m} />)
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="text-5xl">😴</div>
                <h3 className="text-lg font-semibold text-white">Geen live wedstrijden</h3>
                <p className="text-cinema-muted text-sm">
                  {activeTournament
                    ? 'Er worden momenteel geen wedstrijden gespeeld. Bekijk het programma van vandaag.'
                    : 'Er is momenteel geen Premier Padel toernooi bezig.'
                  }
                </p>
                {finishedMatches.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">
                      Vandaag gespeeld
                    </p>
                    {finishedMatches.slice(0, 3).map(m => <MatchCard key={m.id} match={m} />)}
                  </div>
                )}
                {!activeTournament && tournaments.length > 0 && (
                  <button
                    onClick={() => setTab('tournaments')}
                    className="mt-4 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm
                               transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40"
                  >
                    Bekijk kalender →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Schedule / Today tab */}
        {!loading && tab === 'schedule' && (
          <div className="space-y-3 animate-fade-in">
            {activeTournament && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
                <Trophy size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm text-emerald-300 font-medium">{activeTournament.name}</span>
                <span className="text-xs text-cinema-muted ml-auto">📍 {activeTournament.location}</span>
              </div>
            )}

            {noMatchesAtAll ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-5xl">📅</div>
                <h3 className="text-lg font-semibold text-white">Geen wedstrijden vandaag</h3>
                <p className="text-cinema-muted text-sm">
                  {activeTournament
                    ? 'Er staan vandaag geen wedstrijden gepland voor dit toernooi.'
                    : 'Er is momenteel geen Premier Padel toernooi bezig.'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Finished matches */}
                {finishedMatches.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">
                      ✅ Gespeeld ({finishedMatches.length})
                    </p>
                    {finishedMatches.map(m => <MatchCard key={m.id} match={m} />)}
                  </>
                )}

                {/* Live matches */}
                {liveMatches.length > 0 && (
                  <>
                    {finishedMatches.length > 0 && <div className="border-t border-white/5" />}
                    <p className="text-xs font-medium text-red-400 uppercase tracking-wider">
                      🔴 Nu live ({liveMatches.length})
                    </p>
                    {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
                  </>
                )}

                {/* Upcoming matches */}
                {upcomingMatches.length > 0 && (
                  <>
                    {(finishedMatches.length > 0 || liveMatches.length > 0) && <div className="border-t border-white/5" />}
                    <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      ⏰ Komt nog ({upcomingMatches.length})
                    </p>
                    {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Tournaments tab */}
        {!loading && tab === 'tournaments' && (
          <div className="space-y-3 animate-fade-in">
            {tournaments.length > 0 ? (
              tournaments.map(t => <TournamentCard key={t.id} tournament={t} />)
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
