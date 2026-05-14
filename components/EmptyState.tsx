interface EmptyStateProps {
  onRetry: () => void
  contentType?: 'film' | 'serie'
}

export default function EmptyState({ onRetry, contentType = 'film' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-4 animate-fade-in">
      <div className="text-6xl">{contentType === 'serie' ? '📺' : '🎬'}</div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">
          Geen {contentType === 'serie' ? 'series' : 'films'} meer gevonden
        </h3>
        <p className="text-cinema-muted text-sm">
          voor jouw selectie
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium
                   transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/40"
      >
        Opnieuw proberen
      </button>
    </div>
  )
}
