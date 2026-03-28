"use client"

import { useCVStore } from "@/lib/cv-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Plus, Trash2, Sparkles } from "lucide-react"
import { useState } from "react"
import { aiImproveText } from "@/lib/ai"
import { useToast } from "@/components/ui/toast"

export function ExperienceForm() {
  const { cvData, addExperience, updateExperience, removeExperience } =
    useCVStore()
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleImprove = async (id: string, text: string) => {
    if (!text) return
    setAiLoading(id)
    try {
      const improved = await aiImproveText(text)
      updateExperience(id, { description: improved })
      toast("Description improved", "success")
    } catch {
      toast("Failed to improve text. Check your API key.", "error")
    }
    setAiLoading(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Work Experience
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {cvData.experience.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No experience added yet. Click &ldquo;Add&rdquo; to get started.
          </p>
        )}
        {cvData.experience.map((exp, index) => (
          <div
            key={exp.id}
            className="space-y-4 p-4 border rounded-lg relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Position {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(exp.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  placeholder="Software Engineer"
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(exp.id, { position: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  placeholder="Acme Inc."
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(exp.id, { company: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  placeholder="Jan 2020"
                  value={exp.startDate}
                  onChange={(e) =>
                    updateExperience(exp.id, { startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  placeholder="Dec 2023"
                  value={exp.endDate}
                  disabled={exp.current}
                  onChange={(e) =>
                    updateExperience(exp.id, { endDate: e.target.value })
                  }
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) =>
                      updateExperience(exp.id, {
                        current: e.target.checked,
                        endDate: e.target.checked ? "Present" : "",
                      })
                    }
                    className="rounded"
                  />
                  Currently working here
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Description</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleImprove(exp.id, exp.description)}
                  disabled={aiLoading !== null || !exp.description}
                  className="text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {aiLoading === exp.id ? "Improving..." : "AI Improve"}
                </Button>
              </div>
              <Textarea
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
                value={exp.description}
                onChange={(e) =>
                  updateExperience(exp.id, { description: e.target.value })
                }
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
