"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Phone, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "./language-selector"
import { MobileNav } from "./mobile-nav"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: '/', key: 'home' as const },
  { href: '/services', key: 'services' as const },
  { href: '/booking', key: 'booking' as const },
  { href: '/contacts', key: 'contacts' as const },
]

export function Header() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b"
          : "bg-transparent"
      )}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">З</span>
              </div>
              <span className={cn(
                "font-semibold text-lg hidden sm:block transition-colors",
                scrolled ? "text-foreground" : "text-foreground"
              )}>
                {language === 'ru' ? 'Здоровье' : 'Zdorovye'}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    scrolled ? "text-foreground" : "text-foreground"
                  )}
                >
                  {t.nav[link.key]}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <a href="tel:+74212454545" className="hidden md:flex">
                <Button variant="outline" size="sm" className="gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="hidden lg:inline">{t.contact.phoneValue}</span>
                  <span className="lg:hidden">{t.nav.callUs}</span>
                </Button>
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
