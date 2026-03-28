"use client"

import { useCVStore } from "@/lib/cv-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Plus, Trash2 } from "lucide-react"

export function EducationForm() {
  const { cvData, addEducation, updateEducation, removeEducation } =
    useCVStore()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {cvData.education.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No education added yet. Click &ldquo;Add&rdquo; to get started.
          </p>
        )}
        {cvData.education.map((edu, index) => (
          <div
            key={edu.id}
            className="space-y-4 p-4 border rounded-lg relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Education {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(edu.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Input
                  placeholder="MIT"
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(edu.id, { institution: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Degree</label>
                <Input
                  placeholder="Bachelor of Science"
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(edu.id, { degree: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Field of Study</label>
                <Input
                  placeholder="Computer Science"
                  value={edu.field}
                  onChange={(e) =>
                    updateEducation(edu.id, { field: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  placeholder="Sep 2016"
                  value={edu.startDate}
                  onChange={(e) =>
                    updateEducation(edu.id, { startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  placeholder="Jun 2020"
                  value={edu.endDate}
                  onChange={(e) =>
                    updateEducation(edu.id, { endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                placeholder="Notable achievements, coursework, GPA..."
                rows={2}
                value={edu.description}
                onChange={(e) =>
                  updateEducation(edu.id, { description: e.target.value })
                }
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
