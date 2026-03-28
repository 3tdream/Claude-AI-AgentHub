"use client"

import { useCVStore } from "@/lib/cv-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Plus, Trash2 } from "lucide-react"

export function SkillsForm() {
  const { cvData, addSkill, updateSkill, removeSkill } = useCVStore()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Skills
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addSkill}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cvData.skills.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No skills added yet. Click &ldquo;Add&rdquo; to get started.
          </p>
        )}
        {cvData.skills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <div className="flex-1">
              <Input
                placeholder="Skill name (e.g., React)"
                value={skill.name}
                onChange={(e) =>
                  updateSkill(skill.id, { name: e.target.value })
                }
              />
            </div>
            <div className="w-40">
              <Input
                placeholder="Category"
                value={skill.category}
                onChange={(e) =>
                  updateSkill(skill.id, { category: e.target.value })
                }
              />
            </div>
            <div className="w-36">
              <Select
                value={skill.level}
                onChange={(e) =>
                  updateSkill(skill.id, {
                    level: e.target.value as
                      | "beginner"
                      | "intermediate"
                      | "advanced"
                      | "expert",
                  })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSkill(skill.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
