"use client"

import { cn } from "@/lib/utils"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import type { ServiceCategory } from "@/types"

interface ServiceCategoryNavProps {
  active: string
  onChange: (category: string) => void
}

const categories: Array<{ key: string }> = [
  { key: 'all' },
  { key: 'laser' },
  { key: 'injection' },
  { key: 'face' },
  { key: 'body' },
  { key: 'medical' },
  { key: 'removal' },
]

export function ServiceCategoryNav({ active, onChange }: ServiceCategoryNavProps) {
  const { language } = useLanguageStore()
  const t = translations[language]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const label = t.services.categories[cat.key as keyof typeof t.services.categories]
        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              active === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
