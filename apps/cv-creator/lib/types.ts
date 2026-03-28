export interface PersonalInfo {
  fullName: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  summary: string
  photo: string // base64 data URL
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  highlights: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  description: string
}

export interface Skill {
  id: string
  name: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  category: string
}

export interface Language {
  id: string
  name: string
  proficiency: "basic" | "conversational" | "fluent" | "native"
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
}

export interface Project {
  id: string
  name: string
  description: string
  url: string
  technologies: string[]
}

export interface CVData {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  languages: Language[]
  certifications: Certification[]
  projects: Project[]
}

export type TemplateType = "modern" | "classic" | "minimal"

export type FormStep =
  | "personal"
  | "experience"
  | "education"
  | "skills"
  | "additional"

export const FORM_STEPS: { key: FormStep; label: string }[] = [
  { key: "personal", label: "Personal Info" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "additional", label: "Additional" },
]
