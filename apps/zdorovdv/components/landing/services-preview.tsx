"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/section-heading"
import { ServiceCard } from "@/components/shared/service-card"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { services, popularServiceIds } from "@/data/services"
import { useRouter } from "next/navigation"

export function ServicesPreview() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const router = useRouter()
  const popularServices = services.filter((s) => popularServiceIds.includes(s.id))

  return (
    <section className="py-20 bg-accent/30">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeading title={t.services.title} subtitle={t.services.subtitle} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <ServiceCard
                service={service}
                onBook={() => router.push(`/booking?service=${service.id}`)}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/services">
            <Button variant="outline" size="lg" className="gap-2">
              {t.services.viewAll}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
