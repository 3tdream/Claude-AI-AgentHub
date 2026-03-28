"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

interface BookingStepperProps {
  currentStep: number
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const { language } = useLanguageStore()
  const t = translations[language]

  const steps = [
    { num: 1, label: t.booking.steps.service },
    { num: 2, label: t.booking.steps.datetime },
    { num: 3, label: t.booking.steps.contact },
    { num: 4, label: t.booking.steps.confirmation },
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
            currentStep > step.num
              ? "bg-primary text-primary-foreground"
              : currentStep === step.num
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          )}>
            {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
          </div>
          <span className={cn(
            "text-sm hidden sm:block",
            currentStep >= step.num ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={cn(
              "w-8 h-0.5 mx-1",
              currentStep > step.num ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}
