'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { allModules } from '@/data/modules'
import { BookOpen, Clock, ChevronRight, ArrowLeft } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const mod = allModules[moduleId]

  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Модуль не найден</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Все модули
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Модуль
          </div>
          <h1 className="text-4xl font-bold mb-2">{mod.title}</h1>
          <p className="text-lg text-muted-foreground">{mod.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-muted-foreground">{mod.lessons.length} уроков</span>
            <Progress value={0} className="flex-1 max-w-[200px]" />
            <span className="text-xs text-muted-foreground">0%</span>
          </div>
        </div>

        <div className="space-y-3">
          {mod.lessons.map((lesson, i) => (
            <Link
              key={lesson.id}
              href={`/module/${moduleId}/lesson/${lesson.id}`}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{lesson.subtitle}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.duration}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
