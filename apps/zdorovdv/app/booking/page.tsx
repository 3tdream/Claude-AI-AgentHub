"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SectionHeading } from "@/components/shared/section-heading"
import { BookingStepper } from "@/components/booking/booking-stepper"
import { ServiceSelection } from "@/components/booking/service-selection"
import { DatetimeSelection } from "@/components/booking/datetime-selection"
import { ContactForm } from "@/components/booking/contact-form"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import { AiChatButton } from "@/components/chat/ai-chat-button"
import { useBookingStore } from "@/lib/stores/booking-store"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

function BookingContent() {
  const { step, submitted, setServiceId, setStep } = useBookingStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const searchParams = useSearchParams()

  useEffect(() => {
    const serviceId = searchParams.get('service')
    if (serviceId) {
      setServiceId(serviceId)
      setStep(2)
    }
  }, [searchParams, setServiceId, setStep])

  return (
    <div className="container mx-auto px-4 md:px-8">
      <SectionHeading title={t.booking.title} subtitle={t.booking.subtitle} />
      <BookingStepper currentStep={submitted ? 4 : step} />

      {submitted ? (
        <BookingConfirmation />
      ) : (
        <>
          {step === 1 && <ServiceSelection />}
          {step === 2 && <DatetimeSelection />}
          {step === 3 && <ContactForm />}
        </>
      )}
    </div>
  )
}

export default function BookingPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>}>
          <BookingContent />
        </Suspense>
      </main>
      <Footer />
      <AiChatButton />
    </>
  )
}
