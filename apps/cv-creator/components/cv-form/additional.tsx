"use client"

import { useCVStore } from "@/lib/cv-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Languages,
  Award,
  FolderOpen,
  Plus,
  Trash2,
} from "lucide-react"

export function AdditionalForm() {
  const {
    cvData,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addCertification,
    updateCertification,
    removeCertification,
    addProject,
    updateProject,
    removeProject,
  } = useCVStore()

  return (
    <div className="space-y-6">
      {/* Languages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Languages
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addLanguage}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {cvData.languages.map((lang) => (
            <div
              key={lang.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div className="flex-1">
                <Input
                  placeholder="Language"
                  value={lang.name}
                  onChange={(e) =>
                    updateLanguage(lang.id, { name: e.target.value })
                  }
                />
              </div>
              <div className="w-40">
                <Select
                  value={lang.proficiency}
                  onChange={(e) =>
                    updateLanguage(lang.id, {
                      proficiency: e.target.value as
                        | "basic"
                        | "conversational"
                        | "fluent"
                        | "native",
                    })
                  }
                >
                  <option value="basic">Basic</option>
                  <option value="conversational">Conversational</option>
                  <option value="fluent">Fluent</option>
                  <option value="native">Native</option>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLanguage(lang.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certifications
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addCertification}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {cvData.certifications.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div className="flex-1">
                <Input
                  placeholder="Certification name"
                  value={cert.name}
                  onChange={(e) =>
                    updateCertification(cert.id, { name: e.target.value })
                  }
                />
              </div>
              <div className="w-40">
                <Input
                  placeholder="Issuer"
                  value={cert.issuer}
                  onChange={(e) =>
                    updateCertification(cert.id, { issuer: e.target.value })
                  }
                />
              </div>
              <div className="w-32">
                <Input
                  placeholder="Date"
                  value={cert.date}
                  onChange={(e) =>
                    updateCertification(cert.id, { date: e.target.value })
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCertification(cert.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Projects
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addProject}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cvData.projects.map((proj) => (
            <div
              key={proj.id}
              className="space-y-3 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Project name"
                    value={proj.name}
                    onChange={(e) =>
                      updateProject(proj.id, { name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="URL (optional)"
                    value={proj.url}
                    onChange={(e) =>
                      updateProject(proj.id, { url: e.target.value })
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProject(proj.id)}
                  className="text-destructive hover:text-destructive ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Brief description of the project..."
                rows={2}
                value={proj.description}
                onChange={(e) =>
                  updateProject(proj.id, { description: e.target.value })
                }
              />
              <Input
                placeholder="Technologies (comma-separated)"
                value={proj.technologies.join(", ")}
                onChange={(e) =>
                  updateProject(proj.id, {
                    technologies: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
