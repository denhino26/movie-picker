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
  round: number
  category: 'men' | 'women' | string
  tournament: { name: string; level: string }
  teams: Team[]
  score: { sets: SetScore[] }
}
interface Tournament {
  id: number
  name: string
  location: string
  level: string
  start_date: string
  end_date: string
  status: string
  category: string
}

type Tab = 'live' | 'schedule' | 'tournaments'

function roundLabel(round: number): string {
  const labels: Record<number, string> = {
    1: 'Finale', 2: 'Halve finale', 4: 'Kwartfinale',
    8: 'Achtste finale', 16: 'Ronde van 32', 32: 'Ronde van 64',
  }
  return labels[round] ?? `Ronde ${round}`
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
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
  const team1 = match.teams?.[0]?.players?.map(p => p.name).join(' / ') ?? 'TBD'
  const team2 = match.teams?.[1]?.players?.map(p => p.name).join(' / ') ?? 'TBD'
  const sets = match.score?.sets ?? []
  const isLive = match.status === 'live'

  return (
    <div className={`bg-cinema-card rounded-xl border p-4 space-y-3 transition-all duration-200 ${
      isLive ? 'border-red-500/40 shadow-lg shadow-red-900/10' : 'border-white/5'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={match.status} />
          <CategoryBadge category={match.category} />
          <span className="text-xs text-cinema-muted">{roundLabel(match.round)}</span>
        </div>
        <span className="text-xs text-cinema-muted">
          {match.status === 'scheduled' ? formatTime(match.played_at) : formatTime(match.played_at)}
        </span>
      </div>

      {/* Tournament */}
      <div className="flex items-center gap-1.5">
        <Trophy size={12} className="text-amber-400 shrink-0" />
        <span className="text-xs text-amber-400 truncate">{match.tournament?.name}</span>
      </div>

      {/* Score board */}
      <div className="bg-cinema-surface rounded-lg p-3 space-y-2">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium flex-1 truncate mr-3 ${isLive ? 'text-white' : 'text-cinema-text'}`}>
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
            {match.status === 'scheduled' && <span className="text-cinema-muted text-sm">—</span>}
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium flex-1 truncate mr-3 ${isLive ? 'text-white' : 'text-cinema-text'}`}>
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
            {match.status === 'scheduled' && <span className="text-cinema-muted text-sm">—</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const isActive = tournament.status === 'in_progress'
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
        <span>📍 {tournament.location}</span>
        <span>🏆 {tournament.level}</span>
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
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

      const [matchRes, tournRes] = await Promise.all([
        fetch(`/api/padel?endpoint=matches&after_date=${weekAgo}&before_date=${weekAhead}`),
        fetch(`/api/padel?endpoint=tournaments&after_date=${weekAgo}&before_date=${weekAhead}`),
      ])

      const matchData = await matchRes.json()
      const tournData = await tournRes.json()

      const matchList = matchData.data ?? matchData.mock_data ?? matchData ?? []
      const tournList = tournData.data ?? tournData.mock_data ?? tournData ?? []

      setMatches(Array.isArray(matchList) ? matchList : [])
      setTournaments(Array.isArray(tournList) ? tournList : [])
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
    const interval = setInterval(fetchData, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [fetchData])

  const liveMatches = matches.filter(m => m.status === 'live')
  const scheduledMatches = matches.filter(m => m.status === 'scheduled')
  const finishedMatches = matches.filter(m => m.status === 'finished')
  const upcomingMatches = [...scheduledMatches].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  )

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'live', label: '🔴 Live', count: liveMatches.length },
    { key: 'schedule', label: '📅 Programma', count: upcomingMatches.length },
    { key: 'tournaments', label: '🏆 Toernooien', count: tournaments.length },
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
            Laatst bijgewerkt: {lastRefresh.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
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
        {loading && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-cinema-card" />
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🏸</div>
            </div>
            <p className="text-cinema-text text-lg font-medium animate-pulse">
              Padel data laden...
            </p>
          </div>
        )}

        {/* Live tab */}
        {!loading && tab === 'live' && (
          <div className="space-y-3 animate-fade-in">
            {liveMatches.length > 0 ? (
              liveMatches.map(m => <MatchCard key={m.id} match={m} />)
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="text-5xl">😴</div>
                <h3 className="text-lg font-semibold text-white">Geen live wedstrijden</h3>
                <p className="text-cinema-muted text-sm">
                  Er worden momenteel geen padel wedstrijden gespeeld.
                </p>
                {finishedMatches.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">
                      Recente uitslagen
                    </p>
                    {finishedMatches.slice(0, 3).map(m => <MatchCard key={m.id} match={m} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Schedule tab */}
        {!loading && tab === 'schedule' && (
          <div className="space-y-3 animate-fade-in">
            {/* Show live matches first if any */}
            {liveMatches.length > 0 && (
              <>
                <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Nu bezig</p>
                {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
                <div className="border-t border-white/5" />
              </>
            )}

            {upcomingMatches.length > 0 ? (
              <>
                <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">Komende wedstrijden</p>
                {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="text-5xl">📅</div>
                <h3 className="text-lg font-semibold text-white">Geen geplande wedstrijden</h3>
                <p className="text-cinema-muted text-sm">
                  Er staan deze week geen wedstrijden gepland.
                </p>
              </div>
            )}

            {/* Recent results */}
            {finishedMatches.length > 0 && (
              <>
                <div className="border-t border-white/5 mt-4" />
                <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider">Recente uitslagen</p>
                {finishedMatches.slice(0, 5).map(m => <MatchCard key={m.id} match={m} />)}
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
                  Er zijn momenteel geen actieve of komende toernooien.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
