"use client"

import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ServicesPreview } from "@/components/landing/services-preview"
import { StatsSection } from "@/components/landing/stats-section"
import { AboutPreview } from "@/components/landing/about-preview"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CtaSection } from "@/components/landing/cta-section"
import { SpecialistsSection } from "@/components/landing/specialists-section"
import { AiChatButton } from "@/components/chat/ai-chat-button"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ServicesPreview />
        <StatsSection />
        <SpecialistsSection />
        <AboutPreview />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
      <AiChatButton />
    </>
  )
}
