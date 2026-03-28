"use client"

import { MapPin, Phone, Clock, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

export function ContactInfo() {
  const { language } = useLanguageStore()
  const t = translations[language]

  const items = [
    { icon: MapPin, label: t.contact.address, value: t.contact.addressValue },
    { icon: Phone, label: t.contact.phone, value: t.contact.phoneValue, href: 'tel:+74212454545' },
    { icon: Clock, label: t.contact.hours, value: t.contact.hoursValue },
    { icon: Shield, label: t.contact.license, value: t.contact.licenseValue },
  ]

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-sm text-primary hover:underline whitespace-pre-line">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
