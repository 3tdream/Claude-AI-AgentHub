"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SectionHeading } from "@/components/shared/section-heading"
import { ServiceCategoryNav } from "@/components/services/service-category-nav"
import { ServiceList } from "@/components/services/service-list"
import { ServiceDetailDialog } from "@/components/services/service-detail-dialog"
import { AiChatButton } from "@/components/chat/ai-chat-button"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { services } from "@/data/services"
import type { ClinicService } from "@/types"

export default function ServicesPage() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const router = useRouter()
  const [category, setCategory] = useState('all')
  const [selectedService, setSelectedService] = useState<ClinicService | null>(null)

  const filtered = category === 'all'
    ? services
    : services.filter((s) => s.category === category)

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading title={t.services.title} subtitle={t.services.subtitle} />
          <ServiceCategoryNav active={category} onChange={setCategory} />
          <div className="mt-8">
            <ServiceList
              services={filtered}
              onSelect={(s) => setSelectedService(s)}
              onBook={(s) => router.push(`/booking?service=${s.id}`)}
            />
          </div>
        </div>
      </main>
      <Footer />
      <AiChatButton />
      <ServiceDetailDialog
        service={selectedService}
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        onBook={(s) => router.push(`/booking?service=${s.id}`)}
      />
    </>
  )
}
