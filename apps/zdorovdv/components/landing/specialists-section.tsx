"use client"

import { motion } from "framer-motion"
import { User, Star } from "lucide-react"
import { SectionHeading } from "@/components/shared/section-heading"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { specialists } from "@/data/specialists"

export function SpecialistsSection() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const s = t.specialists

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeading title={s.title} subtitle={s.subtitle} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {specialists.map((specialist, i) => {
            const name = language === 'ru' ? specialist.name : specialist.nameEn
            const role = language === 'ru' ? specialist.role : specialist.roleEn
            const desc = language === 'ru' ? specialist.description : specialist.descriptionEn

            return (
              <motion.div
                key={specialist.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="group flex flex-col items-center text-center bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div className="relative mb-5">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <User className="w-12 h-12 text-primary/60" />
                  </div>
                  {/* Experience badge */}
                  <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                    {specialist.experience} {s.experience}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-lg font-semibold text-foreground leading-tight mb-1">
                  {name}
                </h3>
                <p className="text-sm font-medium text-primary mb-3">{role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>

                {/* Stars */}
                <div className="flex gap-1 mt-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
