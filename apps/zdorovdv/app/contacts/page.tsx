"use client"

import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { SectionHeading } from "@/components/shared/section-heading"
import { ContactInfo } from "@/components/contact/contact-info"
import { MapEmbed } from "@/components/contact/map-embed"
import { ContactFormSection } from "@/components/contact/contact-form"
import { AiChatButton } from "@/components/chat/ai-chat-button"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

export default function ContactsPage() {
  const { language } = useLanguageStore()
  const t = translations[language]

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <SectionHeading title={t.contact.title} subtitle={t.contact.subtitle} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ContactInfo />
              <ContactFormSection />
            </div>
            <MapEmbed />
          </div>
        </div>
      </main>
      <Footer />
      <AiChatButton />
    </>
  )
}
