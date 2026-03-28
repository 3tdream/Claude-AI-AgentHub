"use client"

import { useState } from "react"
import { useCVStore } from "@/lib/cv-store"
import { PersonalInfoForm } from "@/components/cv-form/personal-info"
import { ExperienceForm } from "@/components/cv-form/experience"
import { EducationForm } from "@/components/cv-form/education"
import { SkillsForm } from "@/components/cv-form/skills"
import { AdditionalForm } from "@/components/cv-form/additional"
import { CVRenderer } from "@/components/cv-preview/cv-renderer"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import { FORM_STEPS, type FormStep } from "@/lib/types"
import { isCVReadyForPreview } from "@/lib/validation"
import { motion, AnimatePresence } from "motion/react"
import { useToast } from "@/components/ui/toast"
import {
  FileText,
  Save,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  Upload,
  Download,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const stepComponents: Record<FormStep, React.ComponentType> = {
  personal: PersonalInfoForm,
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsForm,
  additional: AdditionalForm,
}

export default function BuilderPage() {
  const { currentStep, setCurrentStep, resetCV, cvData, saveCurrentCV } = useCVStore()
  const [mobilePreview, setMobilePreview] = useState(false)
  const [validationMsg, setValidationMsg] = useState("")
  const { toast } = useToast()

  const cvCheck = isCVReadyForPreview(cvData)

  const handleExportJSON = () => {
    const json = JSON.stringify(cvData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${cvData.personalInfo.fullName || "cv"}-data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast("CV data exported", "success")
  }

  const handleImportJSON = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.personalInfo) {
            useCVStore.setState({ cvData: data, currentStep: "personal" })
            toast("CV data imported successfully", "success")
          } else {
            toast("Invalid CV data format", "error")
          }
        } catch {
          toast("Failed to parse JSON file", "error")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const currentIndex = FORM_STEPS.findIndex((s) => s.key === currentStep)
  const StepComponent = stepComponents[currentStep]

  const goNext = () => {
    if (currentIndex < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[currentIndex + 1].key)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentStep(FORM_STEPS[currentIndex - 1].key)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="hidden sm:inline">CV Creator</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Mobile preview toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobilePreview(!mobilePreview)}
              className="lg:hidden"
            >
              {mobilePreview ? (
                <><EyeOff className="w-4 h-4 mr-1" /> Form</>
              ) : (
                <><Eye className="w-4 h-4 mr-1" /> Preview</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                saveCurrentCV()
                toast("CV saved", "success")
              }}
            >
              <Save className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportJSON}
              title="Export JSON"
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleImportJSON}
              title="Import JSON"
              className="hidden sm:flex"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetCV}
              className="text-destructive hidden sm:flex"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Link href="/preview">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Full Preview</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Step progress */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {FORM_STEPS.map((step, i) => (
              <button
                key={step.key}
                onClick={() => {
                  setCurrentStep(step.key)
                  setMobilePreview(false)
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm transition-colors",
                  currentStep === step.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form — hidden on mobile when preview is active */}
          <div className={cn("space-y-4", mobilePreview && "hidden lg:block")}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              {currentIndex < FORM_STEPS.length - 1 ? (
                <Button onClick={goNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : cvCheck.ready ? (
                <Link href="/preview">
                  <Button>
                    <Eye className="w-4 h-4 mr-1" /> Preview & Download
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setValidationMsg(cvCheck.message)
                    setTimeout(() => setValidationMsg(""), 3000)
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" /> Preview & Download
                </Button>
              )}
            </div>
            {validationMsg && (
              <p className="text-sm text-destructive text-right">{validationMsg}</p>
            )}
          </div>

          {/* Live Preview — visible on desktop always, on mobile when toggled */}
          <div className={cn(
            "sticky top-20 self-start",
            mobilePreview ? "block" : "hidden lg:block"
          )}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Live Preview
            </h3>
            <CVRenderer />
          </div>
        </div>
      </main>

      <AIAssistant />
    </div>
  )
}
