"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, ArrowRight } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { categoryImages } from "@/data/category-images"
import type { ClinicService, ServiceCategory } from "@/types"

interface ServiceDetailDialogProps {
  service: ClinicService | null
  open: boolean
  onClose: () => void
  onBook: (service: ClinicService) => void
}

export function ServiceDetailDialog({ service, open, onClose, onBook }: ServiceDetailDialogProps) {
  const { language } = useLanguageStore()
  const t = translations[language]
  const [imgError, setImgError] = useState(false)

  if (!service) return null

  const name = language === 'ru' ? service.name : service.nameEn
  const description = language === 'ru' ? service.description : service.descriptionEn
  const categoryLabel = t.services.categories[service.category as keyof typeof t.services.categories]
  const catImage = categoryImages[service.category as ServiceCategory]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {catImage && !imgError && (
          <div className="relative h-48 w-full">
            <Image
              src={catImage.src}
              alt={language === 'ru' ? catImage.alt : catImage.altEn}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <Badge variant="secondary" className="backdrop-blur-sm bg-white/80">{categoryLabel}</Badge>
            </div>
          </div>
        )}
        <div className="p-6">
          <DialogHeader>
            {(imgError || !catImage) && (
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{categoryLabel}</Badge>
              </div>
            )}
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold text-lg text-primary">
                {t.services.from} {service.price.toLocaleString()} {t.services.currency}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {service.duration} {t.services.duration}
              </span>
            </div>
          </div>
          <Button
            className="w-full gap-2 mt-4"
            onClick={() => {
              onBook(service)
              onClose()
            }}
          >
            {t.services.bookNow}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
