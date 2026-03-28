"use client"

import { useCVStore } from "@/lib/cv-store"
import { CVRenderer } from "@/components/cv-preview/cv-renderer"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { generatePDF } from "@/lib/pdf-generator"
import { useToast } from "@/components/ui/toast"

export default function PreviewPage() {
  const { cvData } = useCVStore()
  const [downloading, setDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await generatePDF(cvData)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${cvData.personalInfo.fullName || "cv"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast("PDF downloaded successfully", "success")
    } catch (err) {
      console.error("PDF generation failed:", err)
      toast("PDF generation failed. Please try again.", "error")
    }
    setDownloading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            CV Creator
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/builder">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Edit CV
              </Button>
            </Link>
            <Button size="sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Preview */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-4xl">
        <CVRenderer />
      </main>
    </div>
  )
}
