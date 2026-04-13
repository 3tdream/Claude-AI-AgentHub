'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Language = 'ru' | 'en'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (ru: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ru',
  setLang: () => {},
  t: (ru) => ru,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ru')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('uxi-lang') as Language | null
    if (saved === 'en' || saved === 'ru') {
      setLangState(saved)
    }
    setMounted(true)
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('uxi-lang', newLang)
  }

  const t = (ru: string, en: string) => (lang === 'en' ? en : ru)

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

// Static UI translations
export const ui = {
  ru: {
    interactiveCourse: 'Интерактивный курс',
    courseTitle: 'UXI Entry Course',
    courseSubtitle: 'Основы UX/UI дизайна — от теории к практике. Изучите ключевые принципы создания удобных и красивых интерфейсов.',
    meetingsCount: '13 встреч',
    pairsCount: '26 пар по 45 мин',
    totalHours: '~19.5 часов',
    min: 'мин',
    meeting: 'Встреча',
    pair: 'Пара',
    allMeetings: 'Все встречи',
    pairsFormat: '2 пары × 45 мин',
    partNotFound: 'Пара не найдена',
    meetingNotFound: 'Встреча не найдена',
    finishCourse: 'Завершить курс',
  },
  en: {
    interactiveCourse: 'Interactive Course',
    courseTitle: 'UXI Entry Course',
    courseSubtitle: 'UX/UI Design Fundamentals — from theory to practice. Learn key principles of creating usable and beautiful interfaces.',
    meetingsCount: '13 meetings',
    pairsCount: '26 sessions of 45 min',
    totalHours: '~19.5 hours',
    min: 'min',
    meeting: 'Meeting',
    pair: 'Session',
    allMeetings: 'All Meetings',
    pairsFormat: '2 sessions × 45 min',
    partNotFound: 'Session not found',
    meetingNotFound: 'Meeting not found',
    finishCourse: 'Finish Course',
  },
} as const

export function useUI() {
  const { lang } = useLanguage()
  return ui[lang]
}
