"use client"

import { useState } from "react"
import { Send, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

export function ContactFormSection() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t.contact.sendMessage}</CardTitle>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-primary mb-3" />
            <p className="font-medium">{t.contact.messageSent}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder={t.contact.messageName} required />
            <Input placeholder={t.contact.messageEmail} type="email" required />
            <Textarea placeholder={t.contact.messageText} rows={4} required />
            <Button type="submit" className="w-full gap-2">
              <Send className="w-4 h-4" />
              {t.contact.messageSend}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
