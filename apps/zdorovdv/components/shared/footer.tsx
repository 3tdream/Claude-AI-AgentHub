"use client"

import Link from "next/link"
import { MapPin, Phone, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

export function Footer() {
  const { language } = useLanguageStore()
  const t = translations[language]

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">З</span>
              </div>
              <span className="font-semibold text-lg">
                {language === 'ru' ? 'Здоровье' : 'Zdorovye'}
              </span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">{t.footer.description}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.quickLinks}</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-background/70 hover:text-primary transition-colors">{t.nav.home}</Link>
              <Link href="/services" className="text-sm text-background/70 hover:text-primary transition-colors">{t.nav.services}</Link>
              <Link href="/booking" className="text-sm text-background/70 hover:text-primary transition-colors">{t.nav.booking}</Link>
              <Link href="/contacts" className="text-sm text-background/70 hover:text-primary transition-colors">{t.nav.contacts}</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.contactInfo}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t.contact.addressValue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+74212454545" className="hover:text-primary transition-colors">{t.contact.phoneValue}</a>
              </div>
              <div className="flex items-start gap-2 text-sm text-background/70">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="whitespace-pre-line">{t.contact.hoursValue}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-background/20" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-background/50">
          <span>{t.footer.rights}</span>
          <span>{t.footer.license}</span>
        </div>
      </div>
    </footer>
  )
}
