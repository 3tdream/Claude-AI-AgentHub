'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { allModules } from '@/data/modules'
import { SectionRenderer } from '@/components/course/section-renderer'
import { QuizSection } from '@/components/course/quiz'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Clock, BookOpen } from 'lucide-react'

export default function LessonPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>()
  const mod = allModules[moduleId]
  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Модуль не найден</p>
      </div>
    )
  }

  const lessonIndex = mod.lessons.findIndex((l) => l.id === lessonId)
  const lesson = mod.lessons[lessonIndex]
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Урок не найден</p>
      </div>
    )
  }

  const prevLesson = lessonIndex > 0 ? mod.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < mod.lessons.length - 1 ? mod.lessons[lessonIndex + 1] : null
  const progressPct = Math.round(((lessonIndex + 1) / mod.lessons.length) * 100)

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link
            href={`/module/${moduleId}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {mod.title}
          </Link>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {lessonIndex + 1} / {mod.lessons.length}
          </span>
          <Progress value={progressPct} className="w-24" />
        </div>
      </div>

      {/* Lesson content */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <BookOpen className="w-4 h-4" />
            Урок {lessonIndex + 1}
            <span className="mx-1">·</span>
            <Clock className="w-3.5 h-3.5" />
            {lesson.duration}
          </div>
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-lg text-muted-foreground">{lesson.subtitle}</p>
        </header>

        <div className="space-y-6">
          {lesson.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>

        {/* Quiz */}
        {lesson.quiz.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <QuizSection quizzes={lesson.quiz} />
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-12 pt-6 border-t flex items-center justify-between gap-4">
          {prevLesson ? (
            <Link href={`/module/${moduleId}/lesson/${prevLesson.id}`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {prevLesson.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link href={`/module/${moduleId}/lesson/${nextLesson.id}`}>
              <Button className="gap-2">
                {nextLesson.title}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/module/${moduleId}`}>
              <Button className="gap-2">
                Завершить модуль
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}
