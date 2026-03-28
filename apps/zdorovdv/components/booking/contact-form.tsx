"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useBookingStore } from "@/lib/stores/booking-store"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

export function ContactForm() {
  const { clientName, clientPhone, clientEmail, notes, setClientName, setClientPhone, setClientEmail, setNotes, submit, prevStep } = useBookingStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!clientName.trim()) errs.name = t.booking.required
    if (!clientPhone.trim()) errs.phone = t.booking.required
    else if (!/^\+?[0-9\s\-()]{7,18}$/.test(clientPhone.trim())) errs.phone = t.booking.invalidPhone
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (validate()) submit()
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t.booking.name} *</label>
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={t.booking.name}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">{t.booking.phone} *</label>
          <Input
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            type="tel"
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">{t.booking.email}</label>
          <Input
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">{t.booking.notes}</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.booking.notes}
            rows={3}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          {t.booking.back}
        </Button>
        <Button onClick={handleSubmit}>
          {t.booking.submit}
        </Button>
      </div>
    </div>
  )
}
