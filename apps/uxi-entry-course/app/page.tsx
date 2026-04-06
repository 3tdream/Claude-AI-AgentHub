'use client'

import { BookOpen, Palette, Layout, MousePointer, ChevronRight } from 'lucide-react'

const modules = [
  {
    icon: BookOpen,
    title: 'Введение в UX/UI',
    description: 'Что такое UX и UI, зачем это нужно, история дизайна интерфейсов',
    lessons: 4,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Palette,
    title: 'Визуальный дизайн',
    description: 'Цвет, типографика, сетки, композиция и визуальная иерархия',
    lessons: 6,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    icon: MousePointer,
    title: 'UX исследования',
    description: 'Персоны, user journey, юзабилити тестирование, эвристики',
    lessons: 5,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: Layout,
    title: 'Прототипирование',
    description: 'Wireframes, интерактивные прототипы, дизайн-системы',
    lessons: 5,
    color: 'bg-amber-500/10 text-amber-600',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <BookOpen className="w-4 h-4" />
          Интерактивный курс
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          UXI Entry Course
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Основы UX/UI дизайна — от теории к практике.
          Изучите ключевые принципы создания удобных и красивых интерфейсов.
        </p>
      </header>

      {/* Modules Grid */}
      <main className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="group relative p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className={`inline-flex p-3 rounded-lg ${mod.color} mb-4`}>
                <mod.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{mod.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{mod.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{mod.lessons} уроков</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
