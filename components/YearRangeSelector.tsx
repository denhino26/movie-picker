'use client'

import { YearRangeKey, YEAR_RANGES, ALL_YEAR_RANGES } from '@/types/movie'
import { t, UILanguage } from '@/lib/translations'

interface YearRangeSelectorProps {
  selected: YearRangeKey[]
  onToggle: (key: YearRangeKey) => void
  disabled?: boolean
  uiLang: UILanguage
}

export default function YearRangeSelector({ selected, onToggle, disabled, uiLang }: YearRangeSelectorProps) {
  const T = (key: string) => t(uiLang, key)
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-cinema-muted uppercase tracking-wider text-center">
        {T('period')}
        {selected.length === 0 && (
          <span className="normal-case italic ml-2">({T('allYears')})</span>
        )}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {ALL_YEAR_RANGES.map((key) => {
          const isSelected = selected.includes(key)
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              disabled={disabled}
              className={`
                px-3 py-2.5 rounded-full border text-sm font-medium min-h-[44px] sm:min-h-0 sm:py-1.5
                transition-all duration-200 select-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-900/40 scale-105'
                  : 'bg-cinema-surface text-cinema-text border-cinema-card hover:border-amber-400/50 hover:text-white'
                }
              `}
            >
              {YEAR_RANGES[key].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
