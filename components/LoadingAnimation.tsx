import { Film } from 'lucide-react'
import { t, UILanguage } from '@/lib/translations'

interface LoadingAnimationProps {
  uiLang: UILanguage
  contentType: 'film' | 'serie'
}

export default function LoadingAnimation({ uiLang, contentType }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-cinema-card" />
        <div className="absolute inset-0 rounded-full border-4 border-t-red-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Film size={28} className="text-cinema-muted" />
        </div>
      </div>
      <p className="text-cinema-text text-lg font-medium animate-pulse">
        {contentType === 'serie' ? t(uiLang, 'searchingSeries') : t(uiLang, 'searchingFilms')}
      </p>
    </div>
  )
}
