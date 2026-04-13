'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getMeeting } from '@/data/meetings'
import { useLanguage, useUI } from '@/lib/language'
import {
  BookOpen, History, Users, FlaskConical, ClipboardList,
  Palette, Type, Eye, PenTool, Layers, ArrowLeftRight,
  Monitor, Trophy, Clock, ChevronRight, ArrowLeft,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const iconMap: Record<string, React.ElementType> = {
  BookOpen, History, Users, FlaskConical, ClipboardList,
  Palette, Type, Eye, PenTool, Layers, ArrowLeftRight,
  Monitor, Trophy,
}

export default function MeetingPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const { lang } = useLanguage()
  const ui = useUI()
  const meeting = getMeeting(meetingId, lang)

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{ui.meetingNotFound}</p>
      </div>
    )
  }

  const Icon = iconMap[meeting.icon] || BookOpen

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          {ui.allMeetings}
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${meeting.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {ui.meeting} {meeting.number}
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">{meeting.title}</h1>
          <p className="text-lg text-muted-foreground">{meeting.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-muted-foreground">{ui.pairsFormat}</span>
            <Progress value={0} className="flex-1 max-w-[200px]" />
            <span className="text-xs text-muted-foreground">0%</span>
          </div>
        </div>

        <div className="space-y-3">
          {meeting.parts.map((part, i) => (
            <Link
              key={part.id}
              href={`/meeting/${meetingId}/part/${part.id}`}
              className="group flex items-center gap-4 p-5 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-1">{ui.pair} {i + 1}</div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {part.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{part.subtitle}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {part.duration}
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
