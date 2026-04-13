'use client'

import { type Section } from '@/data/types'
import { useLanguage } from '@/lib/language'
import {
  Lightbulb,
  AlertTriangle,
  BookOpen,
  User,
  Target,
  Frown,
  Quote,
  CheckCircle2,
  ArrowRight,
  Play,
  ImageIcon,
} from 'lucide-react'

// ---- Helpers ----

function RichText({ content }: { content: string }) {
  const parts = content.split(/(\*\*.*?\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function useSectionLabels() {
  const { lang } = useLanguage()
  return {
    tip: lang === 'en' ? 'Tip' : 'Совет',
    warning: lang === 'en' ? 'Important' : 'Важно',
    example: lang === 'en' ? 'Example' : 'Пример',
    keyConcepts: lang === 'en' ? 'Key Concepts' : 'Ключевые понятия',
    caseStudy: lang === 'en' ? 'Case Study' : 'Кейс-стади',
    problem: lang === 'en' ? 'Problem' : 'Проблема',
    solution: lang === 'en' ? 'Solution' : 'Решение',
    steps: lang === 'en' ? 'Steps' : 'Шаги',
    result: lang === 'en' ? 'Result' : 'Результат',
    goals: lang === 'en' ? 'Goals' : 'Цели',
    frustrations: lang === 'en' ? 'Frustrations' : 'Фрустрации',
  }
}

// ---- Section Components ----

function TextSection({ content }: { content: string }) {
  return (
    <p className="text-base leading-relaxed text-foreground/80">
      <RichText content={content} />
    </p>
  )
}

function HeadingSection({ content }: { content: string }) {
  return <h2 className="text-2xl font-bold text-foreground mt-2">{content}</h2>
}

function SubheadingSection({ content }: { content: string }) {
  return <h3 className="text-xl font-semibold text-foreground mt-1">{content}</h3>
}

function CalloutSection({
  variant,
  content,
}: {
  variant: 'tip' | 'warning' | 'example'
  content: string
}) {
  const labels = useSectionLabels()
  const styles = {
    tip: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0" />,
      label: labels.tip,
      labelColor: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      label: labels.warning,
      labelColor: 'text-amber-700',
    },
    example: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />,
      label: labels.example,
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
      <p className="text-sm leading-relaxed text-foreground/70">
        <RichText content={content} />
      </p>
    </div>
  )
}

function KeyConceptsSection({
  concepts,
}: {
  concepts: { term: string; definition: string }[]
}) {
  const labels = useSectionLabels()
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{labels.keyConcepts}</h3>
      <div className="grid gap-3">
        {concepts.map((c) => (
          <div
            key={c.term}
            className="flex gap-3 p-3 rounded-lg bg-accent/50 border border-border/50"
          >
            <div className="w-1.5 rounded-full bg-primary shrink-0 self-stretch" />
            <div>
              <span className="font-semibold text-sm text-foreground">{c.term}</span>
              <p className="text-sm text-muted-foreground mt-0.5"><RichText content={c.definition} /></p>
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              <RichText content={event.description} />
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImagePlaceholderSection({ alt, caption }: { alt: string; caption: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
      <div className="text-muted-foreground text-sm mb-1">{alt}</div>
      <div className="text-xs text-muted-foreground/60">{caption}</div>
    </div>
  )
}

function ImageSection({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="rounded-xl overflow-hidden border">
      <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
      {caption && (
        <figcaption className="text-xs text-muted-foreground text-center py-2 px-4 bg-muted/30">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function VideoSection({ src, title, caption }: { src: string; title: string; caption?: string }) {
  const isYoutube = src.includes('youtube.com') || src.includes('youtu.be')
  const embedUrl = isYoutube
    ? src.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
    : src

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Play className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {isYoutube ? (
        <div className="relative aspect-video rounded-xl overflow-hidden border bg-black">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="relative aspect-video rounded-xl overflow-hidden border bg-black">
          <video controls className="w-full h-full" preload="metadata">
            <source src={src} />
          </video>
        </div>
      )}
      {caption && (
        <p className="text-xs text-muted-foreground text-center">{caption}</p>
      )}
    </div>
  )
}

function BeforeAfterSection({
  title,
  before,
  after,
}: {
  title: string
  before: { label: string; description: string; image?: string }
  after: { label: string; description: string; image?: string }
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">✗</span>
            </div>
            <span className="text-sm font-semibold text-red-700">{before.label}</span>
          </div>
          {before.image && (
            <img src={before.image} alt={before.label} className="w-full rounded-lg mb-2" loading="lazy" />
          )}
          <p className="text-sm text-foreground/70"><RichText content={before.description} /></p>
        </div>
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 text-xs font-bold">✓</span>
            </div>
            <span className="text-sm font-semibold text-emerald-700">{after.label}</span>
          </div>
          {after.image && (
            <img src={after.image} alt={after.label} className="w-full rounded-lg mb-2" loading="lazy" />
          )}
          <p className="text-sm text-foreground/70"><RichText content={after.description} /></p>
        </div>
      </div>
    </div>
  )
}

function DiagramSection({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: string[]
}) {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-accent/30 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground"><RichText content={description} /></p>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-background border text-sm font-medium text-foreground shadow-sm">
              {item}
            </div>
            {i < items.length - 1 && (
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CaseStudySection({
  title,
  company,
  problem,
  solution,
  result,
  steps,
}: {
  title: string
  company: string
  problem: string
  solution: string
  result: string
  steps?: { title: string; description: string }[]
}) {
  const labels = useSectionLabels()
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="bg-primary/10 px-5 py-3 border-b">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{labels.caseStudy}</span>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">{company}</span>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <span className="text-xs font-semibold text-red-600 uppercase">{labels.problem}</span>
          <p className="text-sm text-foreground/80 mt-1"><RichText content={problem} /></p>
        </div>
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase">{labels.solution}</span>
          <p className="text-sm text-foreground/80 mt-1"><RichText content={solution} /></p>
        </div>
        {steps && steps.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">{labels.steps}</span>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                  <p className="text-sm text-muted-foreground"><RichText content={step.description} /></p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <span className="text-xs font-semibold text-emerald-700 uppercase">{labels.result}</span>
          <p className="text-sm text-emerald-800 mt-1"><RichText content={result} /></p>
        </div>
      </div>
    </div>
  )
}

function UserPersonaSection({ persona }: { persona: import('@/data/types').PersonaData }) {
  const labels = useSectionLabels()
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 px-5 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{persona.name}, {persona.age}</h3>
            <span className="text-sm text-muted-foreground">{persona.role}</span>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-sm text-foreground/80"><RichText content={persona.bio} /></p>

        {persona.quote && (
          <div className="flex gap-2 px-3 py-2 rounded-lg bg-muted/50 border-l-2 border-primary">
            <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm italic text-muted-foreground">&laquo;{persona.quote}&raquo;</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-foreground">{labels.goals}</span>
            </div>
            <ul className="space-y-1">
              {persona.goals.map((g, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">+</span> <RichText content={g} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Frown className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-foreground">{labels.frustrations}</span>
            </div>
            <ul className="space-y-1">
              {persona.frustrations.map((f, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-400 mt-1">-</span> <RichText content={f} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {persona.traits.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {persona.traits.map((t) => (
              <div key={t.label} className="flex justify-between text-sm px-3 py-1.5 rounded bg-muted/40">
                <span className="text-muted-foreground">{t.label}</span>
                <span className="font-medium text-foreground">{t.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserFlowSection({
  title,
  steps,
}: {
  title: string
  steps: { id: string; label: string; type: 'start' | 'action' | 'decision' | 'end' }[]
  connections: { from: string; to: string; label?: string }[]
}) {
  const stepStyles = {
    start: 'bg-emerald-100 border-emerald-300 text-emerald-800 rounded-full',
    action: 'bg-blue-50 border-blue-200 text-blue-800 rounded-lg',
    decision: 'bg-amber-50 border-amber-200 text-amber-800 rounded-lg rotate-0',
    end: 'bg-red-100 border-red-300 text-red-800 rounded-full',
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl bg-muted/30 border">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`px-4 py-2 border text-sm font-medium ${stepStyles[step.type]}`}>
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ChecklistSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground/80"><RichText content={item} /></span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Static class map to avoid Tailwind purge issues with dynamic classes
const colsClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

function ColumnsSection({ columns }: { columns: { title: string; items: string[] }[] }) {
  const cls = colsClass[Math.min(columns.length, 4)] || colsClass[2]
  return (
    <div className={`grid gap-4 ${cls}`}>
      {columns.map((col) => (
        <div key={col.title} className="rounded-xl border bg-card p-4">
          <h4 className="font-semibold text-sm text-foreground mb-3">{col.title}</h4>
          <ul className="space-y-1.5">
            {col.items.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                <RichText content={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function QuoteSection({ text, author, role }: { text: string; author: string; role?: string }) {
  return (
    <blockquote className="border-l-4 border-primary pl-4 py-2">
      <p className="text-base italic text-foreground/80 mb-2">&laquo;{text}&raquo;</p>
      <footer className="text-sm text-muted-foreground">
        — {author}{role && <span className="text-muted-foreground/60">, {role}</span>}
      </footer>
    </blockquote>
  )
}

function DividerSection() {
  return <hr className="border-border my-2" />
}

// ---- Main Renderer ----

export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'text':
      return <TextSection content={section.content} />
    case 'heading':
      return <HeadingSection content={section.content} />
    case 'subheading':
      return <SubheadingSection content={section.content} />
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
    case 'image':
      return <ImageSection src={section.src} alt={section.alt} caption={section.caption} />
    case 'video':
      return <VideoSection src={section.src} title={section.title} caption={section.caption} />
    case 'before-after':
      return <BeforeAfterSection title={section.title} before={section.before} after={section.after} />
    case 'diagram':
      return <DiagramSection title={section.title} description={section.description} items={section.items} />
    case 'case-study':
      return <CaseStudySection title={section.title} company={section.company} problem={section.problem} solution={section.solution} result={section.result} steps={section.steps} />
    case 'user-persona':
      return <UserPersonaSection persona={section.persona} />
    case 'user-flow':
      return <UserFlowSection title={section.title} steps={section.steps} connections={section.connections} />
    case 'checklist':
      return <ChecklistSection title={section.title} items={section.items} />
    case 'columns':
      return <ColumnsSection columns={section.columns} />
    case 'quote':
      return <QuoteSection text={section.text} author={section.author} role={section.role} />
    case 'divider':
      return <DividerSection />
    default:
      return null
  }
}
