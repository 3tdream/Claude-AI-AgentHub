"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Phone, Menu, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "./language-selector"
import { MobileNav } from "./mobile-nav"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { specialists } from "@/data/specialists"
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
  const [specOpen, setSpecOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSpecOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
              {navLinks.slice(0, 2).map((link) => (
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

              {/* Specialists dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setSpecOpen(!specOpen)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    specOpen && "bg-primary/10 text-primary",
                    scrolled ? "text-foreground" : "text-foreground"
                  )}
                >
                  {t.specialists.title}
                  <ChevronDown className={cn("w-4 h-4 transition-transform", specOpen && "rotate-180")} />
                </button>

                {specOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-muted-foreground px-2 mb-2">{t.booking.selectSpecialist}</p>
                    {specialists.map((spec) => {
                      const name = language === 'ru' ? spec.name : spec.nameEn
                      const role = language === 'ru' ? spec.role : spec.roleEn
                      return (
                        <Link
                          key={spec.id}
                          href={`/booking?specialist=${spec.id}`}
                          onClick={() => setSpecOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <User className="w-5 h-5 text-primary/60" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{name}</p>
                            <p className="text-xs text-muted-foreground truncate">{role}</p>
                          </div>
                          <span className="ml-auto text-xs text-primary/60 shrink-0">
                            {spec.experience} {t.specialists.experience}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {navLinks.slice(2).map((link) => (
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
