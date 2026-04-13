'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { allMeetings, getMeeting } from '@/data/meetings'
import { useLanguage, useUI } from '@/lib/language'
import { SectionRenderer } from '@/components/course/section-renderer'
import { QuizSection } from '@/components/course/quiz'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Clock, BookOpen } from 'lucide-react'

export default function PartPage() {
  const { meetingId, partId } = useParams<{ meetingId: string; partId: string }>()
  const { lang } = useLanguage()
  const ui = useUI()
  const meetings = allMeetings(lang)
  const meeting = getMeeting(meetingId, lang)

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{ui.meetingNotFound}</p>
      </div>
    )
  }

  const partIndex = meeting.parts.findIndex((p) => p.id === partId)
  const part = meeting.parts[partIndex]

  if (!part) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{ui.partNotFound}</p>
      </div>
    )
  }

  const prevPart = partIndex > 0 ? meeting.parts[partIndex - 1] : null
  const nextPart = partIndex < meeting.parts.length - 1 ? meeting.parts[partIndex + 1] : null

  const meetingIndex = meetings.findIndex((m) => m.id === meetingId)
  const nextMeeting = meetingIndex < meetings.length - 1 ? meetings[meetingIndex + 1] : null
  const prevMeeting = meetingIndex > 0 ? meetings[meetingIndex - 1] : null

  const progressPct = Math.round(((partIndex + 1) / meeting.parts.length) * 100)

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link
            href={`/meeting/${meetingId}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {ui.meeting} {meeting.number}
          </Link>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {ui.pair} {partIndex + 1} / {meeting.parts.length}
          </span>
          <Progress value={progressPct} className="w-24" />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <BookOpen className="w-4 h-4" />
            {ui.meeting} {meeting.number}, {ui.pair} {partIndex + 1}
            <span className="mx-1">&middot;</span>
            <Clock className="w-3.5 h-3.5" />
            {part.duration}
          </div>
          <h1 className="text-3xl font-bold mb-2">{part.title}</h1>
          <p className="text-lg text-muted-foreground">{part.subtitle}</p>
        </header>

        <div className="space-y-6">
          {part.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>

        {/* Quiz */}
        {part.quiz.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <QuizSection quizzes={part.quiz} />
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-12 pt-6 border-t flex items-center justify-between gap-4">
          {prevPart ? (
            <Link href={`/meeting/${meetingId}/part/${prevPart.id}`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {ui.pair} 1
              </Button>
            </Link>
          ) : prevMeeting ? (
            <Link href={`/meeting/${prevMeeting.id}/part/${prevMeeting.parts[prevMeeting.parts.length - 1]?.id}`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {ui.meeting} {prevMeeting.number}
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextPart ? (
            <Link href={`/meeting/${meetingId}/part/${nextPart.id}`}>
              <Button className="gap-2">
                {ui.pair} 2
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : nextMeeting ? (
            <Link href={`/meeting/${nextMeeting.id}`}>
              <Button className="gap-2">
                {ui.meeting} {nextMeeting.number}: {nextMeeting.title}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <Button className="gap-2">
                {ui.finishCourse}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}
