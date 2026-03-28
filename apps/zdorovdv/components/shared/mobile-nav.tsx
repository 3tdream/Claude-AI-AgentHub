"use client"

import Link from "next/link"
import { Phone } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

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
          {navLinks.map((link) => (
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
