'use client'

import { type Section } from '@/data/intro-module'
import {
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

function TextSection({ content }: { content: string }) {
  const parts = content.split(/(\*\*.*?\*\*)/g)
  return (
    <p className="text-base leading-relaxed text-foreground/80">
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}

function HeadingSection({ content }: { content: string }) {
  return <h2 className="text-2xl font-bold text-foreground mt-2">{content}</h2>
}

function CalloutSection({
  variant,
  content,
}: {
  variant: 'tip' | 'warning' | 'example'
  content: string
}) {
  const styles = {
    tip: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0" />,
      label: 'Совет',
      labelColor: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      label: 'Важно',
      labelColor: 'text-amber-700',
    },
    example: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />,
      label: 'Пример',
      labelColor: 'text-blue-700',
    },
  }

  const s = styles[variant]

  return (
    <div className={`rounded-xl border p-4 ${s.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        {s.icon}
        <span className={`text-sm font-semibold ${s.labelColor}`}>{s.label}</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/70">{content}</p>
    </div>
  )
}

function KeyConceptsSection({
  concepts,
}: {
  concepts: { term: string; definition: string }[]
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Ключевые понятия</h3>
      <div className="grid gap-3">
        {concepts.map((c) => (
          <div
            key={c.term}
            className="flex gap-3 p-3 rounded-lg bg-accent/50 border border-border/50"
          >
            <div className="w-1.5 rounded-full bg-primary shrink-0 self-stretch" />
            <div>
              <span className="font-semibold text-sm text-foreground">{c.term}</span>
              <p className="text-sm text-muted-foreground mt-0.5">{c.definition}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonSection({
  title,
  items,
}: {
  title: string
  items: { label: string; ux: string; ui: string }[]
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-3 bg-muted/50 text-sm font-semibold">
          <div className="p-3 text-muted-foreground"></div>
          <div className="p-3 text-center text-purple-600">UX</div>
          <div className="p-3 text-center text-blue-600">UI</div>
        </div>
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
          >
            <div className="p-3 font-medium text-foreground">{item.label}</div>
            <div className="p-3 text-center text-muted-foreground">{item.ux}</div>
            <div className="p-3 text-center text-muted-foreground">{item.ui}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineSection({
  events,
}: {
  events: { year: string; title: string; description: string }[]
}) {
  return (
    <div className="space-y-3">
      <div className="relative pl-6 space-y-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
        {events.map((event) => (
          <div key={event.year} className="relative">
            <div className="absolute left-[-21px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {event.year}
              </span>
              <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImagePlaceholderSection({ alt, caption }: { alt: string; caption: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <div className="text-muted-foreground text-sm mb-1">{alt}</div>
      <div className="text-xs text-muted-foreground/60">{caption}</div>
    </div>
  )
}

export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'text':
      return <TextSection content={section.content} />
    case 'heading':
      return <HeadingSection content={section.content} />
    case 'callout':
      return <CalloutSection variant={section.variant} content={section.content} />
    case 'key-concepts':
      return <KeyConceptsSection concepts={section.concepts} />
    case 'comparison':
      return <ComparisonSection title={section.title} items={section.items} />
    case 'timeline':
      return <TimelineSection events={section.events} />
    case 'image-placeholder':
      return <ImagePlaceholderSection alt={section.alt} caption={section.caption} />
    default:
      return null
  }
}
