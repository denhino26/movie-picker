'use client'

import { LanguageCode, LANGUAGE_OPTIONS, ALL_LANGUAGE_CODES } from '@/types/movie'

interface LanguageSelectorProps {
  selected: LanguageCode
  onSelect: (code: LanguageCode) => void
  disabled?: boolean
}

export default function LanguageSelector({ selected, onSelect, disabled }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider text-center">
        Taal
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {ALL_LANGUAGE_CODES.map((code) => {
          const isSelected = selected === code
          return (
            <button
              key={code}
              onClick={() => onSelect(code)}
              disabled={disabled}
              className={`
                px-3 py-2.5 rounded-full border text-sm font-medium min-h-[44px]
                transition-all duration-200 select-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? 'bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-900/40 scale-105'
                  : 'bg-cinema-surface text-cinema-text border-cinema-card hover:border-sky-500/50 hover:text-white'
                }
              `}
            >
              {LANGUAGE_OPTIONS[code].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
