"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

export function CtaSection() {
  const { language } = useLanguageStore()
  const t = translations[language]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-10 md:p-16 text-center text-white overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold">{t.cta.title}</h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">{t.cta.subtitle}</p>
            <Link href="/booking" className="inline-block mt-8">
              <Button size="lg" variant="gold" className="gap-2 text-base px-8">
                <CalendarCheck className="w-5 h-5" />
                {t.cta.button}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
