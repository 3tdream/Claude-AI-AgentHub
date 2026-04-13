// ==========================================
// UXI Entry Course — Data Types
// 13 meetings × 2 parts (45+45 min)
// ==========================================

export interface QuizOption {
  id: string
  text: string
}

export interface Quiz {
  question: string
  options: QuizOption[]
  correctId: string
  explanation: string
}

export interface KeyConcept {
  term: string
  definition: string
}

export interface ComparisonItem {
  label: string
  ux: string
  ui: string
}

export interface PersonaTrait {
  label: string
  value: string
}

export interface PersonaData {
  name: string
  age: number
  role: string
  photo?: string
  bio: string
  goals: string[]
  frustrations: string[]
  traits: PersonaTrait[]
  quote?: string
}

export interface BeforeAfterItem {
  label: string
  description: string
  image?: string
}

export interface CaseStudyStep {
  title: string
  description: string
}

export interface UserFlowStep {
  id: string
  label: string
  type: 'start' | 'action' | 'decision' | 'end'
}

export interface UserFlowConnection {
  from: string
  to: string
  label?: string
}

// ---- Section Types ----

export type Section =
  | { type: 'text'; content: string }
  | { type: 'heading'; content: string }
  | { type: 'subheading'; content: string }
  | { type: 'key-concepts'; concepts: KeyConcept[] }
  | { type: 'comparison'; title: string; items: ComparisonItem[] }
  | { type: 'timeline'; events: { year: string; title: string; description: string }[] }
  | { type: 'callout'; variant: 'tip' | 'warning' | 'example'; content: string }
  | { type: 'image-placeholder'; alt: string; caption: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; title: string; caption?: string }
  | { type: 'before-after'; title: string; before: BeforeAfterItem; after: BeforeAfterItem }
  | { type: 'diagram'; title: string; description: string; items: string[] }
  | { type: 'case-study'; title: string; company: string; problem: string; solution: string; result: string; steps?: CaseStudyStep[] }
  | { type: 'user-persona'; persona: PersonaData }
  | { type: 'user-flow'; title: string; steps: UserFlowStep[]; connections: UserFlowConnection[] }
  | { type: 'checklist'; title: string; items: string[] }
  | { type: 'columns'; columns: { title: string; items: string[] }[] }
  | { type: 'quote'; text: string; author: string; role?: string }
  | { type: 'divider' }

// ---- Meeting Structure ----

export interface MeetingPart {
  id: string
  title: string
  subtitle: string
  duration: string
  sections: Section[]
  quiz: Quiz[]
}

export interface Meeting {
  id: string
  number: number
  title: string
  description: string
  icon: string
  color: string
  parts: MeetingPart[]
}
