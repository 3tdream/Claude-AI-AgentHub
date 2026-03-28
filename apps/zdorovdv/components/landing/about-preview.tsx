"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { SectionHeading } from "@/components/shared/section-heading"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { clinicImage } from "@/data/category-images"

export function AboutPreview() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const [imgError, setImgError] = useState(false)

  return (
    <section className="py-20 bg-accent/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              {!imgError ? (
                <Image
                  src={clinicImage.src}
                  alt={language === 'ru' ? clinicImage.alt : clinicImage.altEn}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">🏥</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {language === 'ru' ? 'МЦ «Здоровье»' : 'MC "Zdorovye"'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeading title={t.about.title} subtitle={t.about.subtitle} align="left" />
            <p className="text-muted-foreground leading-relaxed mb-6">{t.about.description}</p>
            <ul className="space-y-3">
              {t.about.features.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
