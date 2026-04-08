"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ServiceCategoryNav } from "@/components/services/service-category-nav"
import { ServiceCard } from "@/components/shared/service-card"
import { useBookingStore } from "@/lib/stores/booking-store"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { services } from "@/data/services"
import { specialists } from "@/data/specialists"

export function ServiceSelection() {
  const { selectedServiceId, selectedSpecialistId, setServiceId, nextStep } = useBookingStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const [category, setCategory] = useState('all')

  // If specialist is pre-selected (from header menu), filter services to their serviceIds
  const specialist = selectedSpecialistId
    ? specialists.find((s) => s.id === selectedSpecialistId)
    : null

  const available = specialist
    ? services.filter((s) => specialist.serviceIds.includes(s.id))
    : services

  const filtered = category === 'all'
    ? available
    : available.filter((s) => s.category === category)

  const specialistName = specialist
    ? (language === 'ru' ? specialist.name : specialist.nameEn)
    : ''

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{t.booking.selectService}</h3>
      {specialist && (
        <p className="text-sm text-muted-foreground mb-4">
          {t.booking.servicesForSpecialist}: <span className="font-medium text-foreground">{specialistName}</span>
        </p>
      )}
      <ServiceCategoryNav active={category} onChange={setCategory} />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selectedServiceId === service.id}
            onSelect={(s) => setServiceId(s.id)}
            compact
          />
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={nextStep} disabled={!selectedServiceId}>
          {t.booking.next}
        </Button>
      </div>
    </div>
  )
}
