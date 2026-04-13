'use client'

import { useLanguage } from '@/lib/language'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <button
      onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border shadow-sm hover:shadow-md transition-all text-sm font-medium"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span className="text-foreground">{lang === 'ru' ? 'EN' : 'RU'}</span>
    </button>
  )
}
