"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Briefcase, X } from "lucide-react"
import { useCVStore } from "@/lib/cv-store"
import { aiTailorForJob } from "@/lib/ai"
import { useToast } from "@/components/ui/toast"

export function AIAssistant() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const { cvData, updatePersonalInfo } = useCVStore()

  const handleTailor = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    setResult("")
    try {
      const cvContent = [
        cvData.personalInfo.summary,
        ...cvData.experience.map(
          (e) => `${e.position} at ${e.company}: ${e.description}`
        ),
      ]
        .filter(Boolean)
        .join("\n\n")

      const tailored = await aiTailorForJob(cvContent, jobDescription)
      setResult(tailored)
    } catch {
      setResult("")
      toast("Failed to generate tailored content", "error")
    }
    setLoading(false)
  }

  const applyResult = () => {
    if (result) {
      updatePersonalInfo({ summary: result })
      setResult("")
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 shadow-lg"
        size="lg"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        AI Assistant
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 z-50">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              Paste a job description to tailor your CV
            </label>
            <Textarea
              placeholder="Paste the job description here..."
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={handleTailor}
            disabled={loading || !jobDescription.trim()}
            className="w-full"
            size="sm"
          >
            {loading ? "Tailoring..." : "Tailor My CV"}
          </Button>

          {result && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-md text-xs text-gray-700 max-h-40 overflow-auto">
                {result}
              </div>
              <Button onClick={applyResult} size="sm" variant="outline" className="w-full">
                Apply as Summary
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
