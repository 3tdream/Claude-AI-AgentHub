"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBookingStore } from "@/lib/stores/booking-store"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { services } from "@/data/services"
import { specialists } from "@/data/specialists"

export function BookingConfirmation() {
  const { selectedServiceId, selectedSpecialistId, selectedDate, selectedTime, clientName, reset } = useBookingStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const service = services.find((s) => s.id === selectedServiceId)
  const specialist = specialists.find((s) => s.id === selectedSpecialistId)
  const serviceName = service ? (language === 'ru' ? service.name : service.nameEn) : ''
  const specialistName = specialist ? (language === 'ru' ? specialist.name : specialist.nameEn) : ''

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-md mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="w-20 h-20 text-primary mx-auto" />
      </motion.div>

      <h2 className="text-2xl font-bold mt-6">{t.booking.success}</h2>
      <p className="text-muted-foreground mt-2">{t.booking.successMessage}</p>

      <div className="mt-6 bg-muted/50 rounded-lg p-4 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.booking.steps.service}:</span>
          <span className="font-medium">{serviceName}</span>
        </div>
        {specialistName && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.booking.steps.specialist}:</span>
            <span className="font-medium">{specialistName}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.booking.steps.datetime}:</span>
          <span className="font-medium">{selectedDate} {selectedTime}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.booking.name}:</span>
          <span className="font-medium">{clientName}</span>
        </div>
      </div>

      <Link href="/" className="inline-block mt-8">
        <Button variant="outline" className="gap-2" onClick={reset}>
          <Home className="w-4 h-4" />
          {t.booking.backToHome}
        </Button>
      </Link>
    </motion.div>
  )
}
