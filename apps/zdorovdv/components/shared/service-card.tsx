"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { categoryImages } from "@/data/category-images"
import { cn } from "@/lib/utils"
import type { ClinicService, ServiceCategory } from "@/types"

interface ServiceCardProps {
  service: ClinicService
  onBook?: (service: ClinicService) => void
  selected?: boolean
  onSelect?: (service: ClinicService) => void
  compact?: boolean
}

const categoryGradients: Record<string, string> = {
  laser: 'from-violet-100 to-purple-50',
  injection: 'from-blue-100 to-cyan-50',
  face: 'from-rose-100 to-pink-50',
  body: 'from-amber-100 to-orange-50',
  medical: 'from-emerald-100 to-green-50',
  removal: 'from-slate-100 to-gray-50',
}

export function ServiceCard({ service, onBook, selected, onSelect, compact }: ServiceCardProps) {
  const { language } = useLanguageStore()
  const t = translations[language]
  const [imgError, setImgError] = useState(false)
  const name = language === 'ru' ? service.name : service.nameEn
  const description = language === 'ru' ? service.description : service.descriptionEn
  const categoryLabel = t.services.categories[service.category as keyof typeof t.services.categories]
  const catImage = categoryImages[service.category as ServiceCategory]

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden",
        selected && "ring-2 ring-primary shadow-lg",
        !compact && "hover:-translate-y-1"
      )}
      onClick={() => onSelect?.(service)}
    >
      {!compact && (
        <div className="relative h-40 overflow-hidden">
          {catImage && !imgError ? (
            <Image
              src={catImage.src}
              alt={language === 'ru' ? catImage.alt : catImage.altEn}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={cn("w-full h-full bg-gradient-to-br", categoryGradients[service.category] || 'from-gray-100 to-gray-50')} />
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-white/80">{categoryLabel}</Badge>
          </div>
        </div>
      )}
      <CardContent className={cn(compact ? "p-4" : "p-5")}>
        {compact && (
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="text-xs">{categoryLabel}</Badge>
          </div>
        )}
        <h3 className={cn("font-semibold text-foreground mb-1", compact ? "text-sm" : "text-base")}>{name}</h3>
        {!compact && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">
              {t.services.from} {service.price.toLocaleString()} {t.services.currency}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {service.duration} {t.services.duration}
            </span>
          </div>
          {onBook && (
            <Button
              size="sm"
              variant="ghost"
              className="text-primary hover:text-primary"
              onClick={(e) => {
                e.stopPropagation()
                onBook(service)
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
