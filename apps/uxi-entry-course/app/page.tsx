'use client'

import Link from 'next/link'
import {
  BookOpen, History, Users, FlaskConical, ClipboardList,
  Palette, Type, Eye, PenTool, Layers, ArrowLeftRight,
  Monitor, Trophy, ChevronRight, GraduationCap, Clock,
} from 'lucide-react'
import { useLanguage, useUI } from '@/lib/language'

const iconMap: Record<string, React.ElementType> = {
  BookOpen, History, Users, FlaskConical, ClipboardList,
  Palette, Type, Eye, PenTool, Layers, ArrowLeftRight,
  Monitor, Trophy,
}

const meetings = {
  ru: [
    { id: '1', icon: 'BookOpen', title: 'Введение в UX/UI', description: 'Что такое UX и UI, зачем это нужно, примеры хорошего и плохого дизайна', color: 'bg-blue-500/10 text-blue-600' },
    { id: '2', icon: 'History', title: 'История и роли', description: 'Эволюция интерфейсов от CLI до AI, роли в команде, Double Diamond', color: 'bg-indigo-500/10 text-indigo-600' },
    { id: '3', icon: 'Users', title: 'UX Research: основы', description: 'Персоны, Empathy Map, JTBD, User Journey Map', color: 'bg-emerald-500/10 text-emerald-600' },
    { id: '4', icon: 'FlaskConical', title: 'UX Research: практика', description: 'Юзабилити-тестирование, эвристики Нильсена, метрики', color: 'bg-teal-500/10 text-teal-600' },
    { id: '5', icon: 'ClipboardList', title: 'User Research методы', description: 'Интервью, опросы, Card Sorting, User Cases и Stories', color: 'bg-cyan-500/10 text-cyan-600' },
    { id: '6', icon: 'Palette', title: 'Теория цвета', description: 'Цветовой круг, гармонии, психология, палитры для web/mobile/SaaS', color: 'bg-purple-500/10 text-purple-600' },
    { id: '7', icon: 'Type', title: 'Типографика и сетки', description: 'Шрифты, модульные сетки, 8px система, responsive дизайн', color: 'bg-pink-500/10 text-pink-600' },
    { id: '8', icon: 'Eye', title: 'Визуальная иерархия', description: 'Контраст, F/Z-паттерны, иконки, иллюстрации, композиция', color: 'bg-orange-500/10 text-orange-600' },
    { id: '9', icon: 'PenTool', title: 'Wireframing', description: 'От идеи к wireframe, Crazy 8s, lo-fi для web/mobile/SaaS', color: 'bg-amber-500/10 text-amber-600' },
    { id: '10', icon: 'Layers', title: 'Прототипирование', description: 'Интерактивные прототипы, Figma, дизайн-системы', color: 'bg-lime-500/10 text-lime-600' },
    { id: '11', icon: 'ArrowLeftRight', title: 'Handoff и итерации', description: 'Handoff разработчику, A/B тесты, data-driven design', color: 'bg-sky-500/10 text-sky-600' },
    { id: '12', icon: 'Monitor', title: 'Платформы: Web/Mobile/SaaS/Data', description: 'Паттерны платформ, accessibility, responsive audit', color: 'bg-violet-500/10 text-violet-600' },
    { id: '13', icon: 'Trophy', title: 'Финальный проект', description: 'Обзор инструментов, чеклист, презентация проекта', color: 'bg-rose-500/10 text-rose-600' },
  ],
  en: [
    { id: '1', icon: 'BookOpen', title: 'Introduction to UX/UI', description: 'What is UX and UI, why it matters, good and bad design examples', color: 'bg-blue-500/10 text-blue-600' },
    { id: '2', icon: 'History', title: 'History & Roles', description: 'Interface evolution from CLI to AI, team roles, Double Diamond', color: 'bg-indigo-500/10 text-indigo-600' },
    { id: '3', icon: 'Users', title: 'UX Research: Fundamentals', description: 'Personas, Empathy Map, JTBD, User Journey Map', color: 'bg-emerald-500/10 text-emerald-600' },
    { id: '4', icon: 'FlaskConical', title: 'UX Research: Practice', description: 'Usability testing, Nielsen heuristics, metrics', color: 'bg-teal-500/10 text-teal-600' },
    { id: '5', icon: 'ClipboardList', title: 'User Research Methods', description: 'Interviews, surveys, Card Sorting, User Cases & Stories', color: 'bg-cyan-500/10 text-cyan-600' },
    { id: '6', icon: 'Palette', title: 'Color Theory', description: 'Color wheel, harmonies, psychology, palettes for web/mobile/SaaS', color: 'bg-purple-500/10 text-purple-600' },
    { id: '7', icon: 'Type', title: 'Typography & Grids', description: 'Fonts, modular grids, 8px system, responsive design', color: 'bg-pink-500/10 text-pink-600' },
    { id: '8', icon: 'Eye', title: 'Visual Hierarchy', description: 'Contrast, F/Z-patterns, icons, illustrations, composition', color: 'bg-orange-500/10 text-orange-600' },
    { id: '9', icon: 'PenTool', title: 'Wireframing', description: 'From idea to wireframe, Crazy 8s, lo-fi for web/mobile/SaaS', color: 'bg-amber-500/10 text-amber-600' },
    { id: '10', icon: 'Layers', title: 'Prototyping', description: 'Interactive prototypes, Figma, design systems', color: 'bg-lime-500/10 text-lime-600' },
    { id: '11', icon: 'ArrowLeftRight', title: 'Handoff & Iterations', description: 'Developer handoff, A/B tests, data-driven design', color: 'bg-sky-500/10 text-sky-600' },
    { id: '12', icon: 'Monitor', title: 'Platforms: Web/Mobile/SaaS/Data', description: 'Platform patterns, accessibility, responsive audit', color: 'bg-violet-500/10 text-violet-600' },
    { id: '13', icon: 'Trophy', title: 'Final Project', description: 'Tools overview, checklist, project presentation', color: 'bg-rose-500/10 text-rose-600' },
  ],
}

export default function HomePage() {
  const { lang } = useLanguage()
  const ui = useUI()
  const list = meetings[lang]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="px-4 sm:px-6 py-10 sm:py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 sm:mb-6">
          <GraduationCap className="w-4 h-4" />
          {ui.interactiveCourse}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
          {ui.courseTitle}
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {ui.courseSubtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mt-8 text-sm text-muted-foreground">
          <span>{ui.meetingsCount}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 hidden sm:block" />
          <span>{ui.pairsCount}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 hidden sm:block" />
          <span>{ui.totalHours}</span>
        </div>
      </header>

      {/* Meetings List */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        <div className="space-y-3">
          {list.map((m) => {
            const Icon = iconMap[m.icon] || BookOpen
            return (
              <Link
                key={m.id}
                href={`/meeting/${m.id}`}
                className="group flex items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm shrink-0">
                  {m.id}
                </div>
                <div className={`p-2 sm:p-2.5 rounded-lg ${m.color} shrink-0 hidden sm:block`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                    {m.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{m.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    90 {ui.min}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
