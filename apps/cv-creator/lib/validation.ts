import type { CVData } from "./types"

export interface ValidationErrors {
  fullName?: string
  email?: string
  title?: string
}

export function validatePersonalInfo(data: CVData["personalInfo"]): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!data.fullName.trim()) errors.fullName = "Name is required"
  if (!data.email.trim()) {
    errors.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format"
  }
  if (!data.title.trim()) errors.title = "Professional title is required"
  return errors
}

export function isCVReadyForPreview(data: CVData): { ready: boolean; message: string } {
  const { personalInfo } = data
  if (!personalInfo.fullName.trim()) {
    return { ready: false, message: "Please add your name before previewing" }
  }
  if (!personalInfo.email.trim()) {
    return { ready: false, message: "Please add your email before previewing" }
  }
  if (data.experience.length === 0 && data.education.length === 0) {
    return { ready: false, message: "Please add at least one experience or education entry" }
  }
  return { ready: true, message: "" }
}
