"use client"

import { useCVStore } from "@/lib/cv-store"
import { TemplateModern } from "./template-modern"
import { TemplateClassic } from "./template-classic"
import { TemplateMinimal } from "./template-minimal"
import { Button } from "@/components/ui/button"
import type { TemplateType } from "@/lib/types"
import { Layout, FileText, Minus } from "lucide-react"

const templates: { key: TemplateType; label: string; icon: React.ReactNode }[] = [
  { key: "modern", label: "Modern", icon: <Layout className="w-4 h-4" /> },
  { key: "classic", label: "Classic", icon: <FileText className="w-4 h-4" /> },
  { key: "minimal", label: "Minimal", icon: <Minus className="w-4 h-4" /> },
]

export function CVRenderer() {
  const { cvData, template, setTemplate } = useCVStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {templates.map((t) => (
          <Button
            key={t.key}
            variant={template === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setTemplate(t.key)}
            className="text-xs"
          >
            {t.icon}
            <span className="ml-1">{t.label}</span>
          </Button>
        ))}
      </div>

      <div className="border rounded-lg overflow-auto bg-gray-50 p-4 max-h-[80vh]">
        <div className="transform scale-[0.85] origin-top-left w-[117.6%]">
          {template === "modern" && <TemplateModern data={cvData} />}
          {template === "classic" && <TemplateClassic data={cvData} />}
          {template === "minimal" && <TemplateMinimal data={cvData} />}
        </div>
      </div>
    </div>
  )
}
