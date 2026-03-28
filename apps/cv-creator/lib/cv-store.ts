"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  CVData,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Project,
  TemplateType,
  FormStep,
} from "./types"

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

const defaultPersonalInfo: PersonalInfo = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  summary: "",
  photo: "",
}

export interface SavedCV {
  id: string
  name: string
  data: CVData
  template: TemplateType
  updatedAt: number
}

interface CVStore {
  cvData: CVData
  currentStep: FormStep
  template: TemplateType
  activeCVId: string | null
  savedCVs: SavedCV[]

  setCurrentStep: (step: FormStep) => void
  setTemplate: (template: TemplateType) => void

  updatePersonalInfo: (info: Partial<PersonalInfo>) => void

  addExperience: () => void
  updateExperience: (id: string, data: Partial<Experience>) => void
  removeExperience: (id: string) => void

  addEducation: () => void
  updateEducation: (id: string, data: Partial<Education>) => void
  removeEducation: (id: string) => void

  addSkill: () => void
  updateSkill: (id: string, data: Partial<Skill>) => void
  removeSkill: (id: string) => void

  addLanguage: () => void
  updateLanguage: (id: string, data: Partial<Language>) => void
  removeLanguage: (id: string) => void

  addCertification: () => void
  updateCertification: (id: string, data: Partial<Certification>) => void
  removeCertification: (id: string) => void

  addProject: () => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void

  resetCV: () => void

  // Multi-CV management
  saveCurrentCV: (name?: string) => void
  loadCV: (id: string) => void
  deleteCV: (id: string) => void
  renameCV: (id: string, name: string) => void
  createNewCV: () => void
}

const initialCVData: CVData = {
  personalInfo: defaultPersonalInfo,
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
}

export const useCVStore = create<CVStore>()(
  persist(
    (set, get) => ({
      cvData: initialCVData,
      currentStep: "personal",
      template: "modern",
      activeCVId: null,
      savedCVs: [],

      setCurrentStep: (step) => set({ currentStep: step }),
      setTemplate: (template) => set({ template }),

      updatePersonalInfo: (info) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            personalInfo: { ...state.cvData.personalInfo, ...info },
          },
        })),

      addExperience: () =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            experience: [
              ...state.cvData.experience,
              {
                id: generateId(),
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
                highlights: [],
              },
            ],
          },
        })),

      updateExperience: (id, data) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            experience: state.cvData.experience.map((exp) =>
              exp.id === id ? { ...exp, ...data } : exp
            ),
          },
        })),

      removeExperience: (id) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            experience: state.cvData.experience.filter((exp) => exp.id !== id),
          },
        })),

      addEducation: () =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            education: [
              ...state.cvData.education,
              {
                id: generateId(),
                institution: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                description: "",
              },
            ],
          },
        })),

      updateEducation: (id, data) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            education: state.cvData.education.map((edu) =>
              edu.id === id ? { ...edu, ...data } : edu
            ),
          },
        })),

      removeEducation: (id) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            education: state.cvData.education.filter((edu) => edu.id !== id),
          },
        })),

      addSkill: () =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            skills: [
              ...state.cvData.skills,
              {
                id: generateId(),
                name: "",
                level: "intermediate",
                category: "",
              },
            ],
          },
        })),

      updateSkill: (id, data) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            skills: state.cvData.skills.map((skill) =>
              skill.id === id ? { ...skill, ...data } : skill
            ),
          },
        })),

      removeSkill: (id) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            skills: state.cvData.skills.filter((skill) => skill.id !== id),
          },
        })),

      addLanguage: () =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            languages: [
              ...state.cvData.languages,
              { id: generateId(), name: "", proficiency: "conversational" },
            ],
          },
        })),

      updateLanguage: (id, data) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            languages: state.cvData.languages.map((lang) =>
              lang.id === id ? { ...lang, ...data } : lang
            ),
          },
        })),

      removeLanguage: (id) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            languages: state.cvData.languages.filter((lang) => lang.id !== id),
          },
        })),

      addCertification: () =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            certifications: [
              ...state.cvData.certifications,
              { id: generateId(), name: "", issuer: "", date: "" },
            ],
          },
        })),

      updateCertification: (id, data) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            certifications: state.cvData.certifications.map((cert) =>
              cert.id === id ? { ...cert, ...data } : cert
            ),
          },
        })),

      removeCertification: (id) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            certifications: state.cvData.certifications.filter(
              (cert) => cert.id !== id
            ),
          },
        })),

      addProject: () =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            projects: [
              ...state.cvData.projects,
              {
                id: generateId(),
                name: "",
                description: "",
                url: "",
                technologies: [],
              },
            ],
          },
        })),

      updateProject: (id, data) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            projects: state.cvData.projects.map((proj) =>
              proj.id === id ? { ...proj, ...data } : proj
            ),
          },
        })),

      removeProject: (id) =>
        set((state) => ({
          cvData: {
            ...state.cvData,
            projects: state.cvData.projects.filter((proj) => proj.id !== id),
          },
        })),

      resetCV: () => set({ cvData: initialCVData, currentStep: "personal", activeCVId: null }),

      saveCurrentCV: (name) => {
        const state = get()
        const cvName = name || state.cvData.personalInfo.fullName || "Untitled CV"
        const now = Date.now()

        if (state.activeCVId) {
          // Update existing
          set({
            savedCVs: state.savedCVs.map((cv) =>
              cv.id === state.activeCVId
                ? { ...cv, name: cvName, data: state.cvData, template: state.template, updatedAt: now }
                : cv
            ),
          })
        } else {
          // Create new
          const id = generateId()
          set({
            activeCVId: id,
            savedCVs: [
              ...state.savedCVs,
              { id, name: cvName, data: state.cvData, template: state.template, updatedAt: now },
            ],
          })
        }
      },

      loadCV: (id) => {
        const state = get()
        const cv = state.savedCVs.find((c) => c.id === id)
        if (cv) {
          set({
            cvData: cv.data,
            template: cv.template,
            activeCVId: cv.id,
            currentStep: "personal",
          })
        }
      },

      deleteCV: (id) =>
        set((state) => ({
          savedCVs: state.savedCVs.filter((cv) => cv.id !== id),
          activeCVId: state.activeCVId === id ? null : state.activeCVId,
        })),

      renameCV: (id, name) =>
        set((state) => ({
          savedCVs: state.savedCVs.map((cv) =>
            cv.id === id ? { ...cv, name } : cv
          ),
        })),

      createNewCV: () =>
        set({
          cvData: initialCVData,
          currentStep: "personal",
          template: "modern",
          activeCVId: null,
        }),
    }),
    { name: "cv-creator-store" }
  )
)
