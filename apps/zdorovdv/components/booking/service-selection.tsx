"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ServiceCategoryNav } from "@/components/services/service-category-nav"
import { ServiceCard } from "@/components/shared/service-card"
import { useBookingStore } from "@/lib/stores/booking-store"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { services } from "@/data/services"

export function ServiceSelection() {
  const { selectedServiceId, setServiceId, nextStep } = useBookingStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const [category, setCategory] = useState('all')

  const filtered = category === 'all'
    ? services
    : services.filter((s) => s.category === category)

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t.booking.selectService}</h3>
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
