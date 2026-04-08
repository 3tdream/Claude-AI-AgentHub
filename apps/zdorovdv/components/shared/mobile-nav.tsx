"use client"

import { useState } from "react"
import Link from "next/link"
import { Phone, User, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { specialists } from "@/data/specialists"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

const navLinks = [
  { href: '/', key: 'home' as const },
  { href: '/services', key: 'services' as const },
  { href: '/booking', key: 'booking' as const },
  { href: '/contacts', key: 'contacts' as const },
]

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { language } = useLanguageStore()
  const t = translations[language]
  const [specExpanded, setSpecExpanded] = useState(false)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold">З</span>
            </div>
            {language === 'ru' ? 'Здоровье' : 'Zdorovye'}
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={onClose}
              className="px-3 py-3 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {t.nav[link.key]}
            </Link>
          ))}

          {/* Specialists accordion */}
          <button
            onClick={() => setSpecExpanded(!specExpanded)}
            className="flex items-center justify-between px-3 py-3 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {t.specialists.title}
            <ChevronDown className={cn("w-4 h-4 transition-transform", specExpanded && "rotate-180")} />
          </button>
          {specExpanded && (
            <div className="ml-3 flex flex-col gap-1">
              {specialists.map((spec) => {
                const name = language === 'ru' ? spec.name : spec.nameEn
                const role = language === 'ru' ? spec.role : spec.roleEn
                return (
                  <Link
                    key={spec.id}
                    href={`/booking?specialist=${spec.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary/60" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{role}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={onClose}
              className="px-3 py-3 rounded-md text-base font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>
        <Separator className="my-6" />
        <a href="tel:+74212454545">
          <Button variant="outline" className="w-full gap-2">
            <Phone className="w-4 h-4" />
            {t.contact.phoneValue}
          </Button>
        </a>
      </SheetContent>
    </Sheet>
  )
}
