"use client"

import { useCVStore } from "@/lib/cv-store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Globe, Linkedin, Sparkles, Camera, X } from "lucide-react"
import { useState, useRef } from "react"
import { aiImproveText, aiGenerateSummary } from "@/lib/ai"
import { validatePersonalInfo } from "@/lib/validation"
import { useToast } from "@/components/ui/toast"

export function PersonalInfoForm() {
  const { cvData, updatePersonalInfo } = useCVStore()
  const { personalInfo } = cvData
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be under 2MB", "error")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      updatePersonalInfo({ photo: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const errors = validatePersonalInfo(personalInfo)
  const showError = (field: string) => touched[field] && errors[field as keyof typeof errors]

  const handleImprove = async (field: "summary") => {
    if (!personalInfo[field]) return
    setAiLoading(field)
    try {
      const improved = await aiImproveText(personalInfo[field])
      updatePersonalInfo({ [field]: improved })
      toast("Text improved successfully", "success")
    } catch {
      toast("Failed to improve text. Check your API key.", "error")
    }
    setAiLoading(null)
  }

  const handleGenerateSummary = async () => {
    const experience = cvData.experience
      .map((e) => `${e.position} at ${e.company}: ${e.description}`)
      .join("\n")
    if (!experience && !personalInfo.title) return
    setAiLoading("generate")
    try {
      const summary = await aiGenerateSummary(
        experience || "No experience listed yet",
        personalInfo.title
      )
      updatePersonalInfo({ summary })
      toast("Summary generated successfully", "success")
    } catch {
      toast("Failed to generate summary. Check your API key.", "error")
    }
    setAiLoading(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo Upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {personalInfo.photo ? (
              <div className="relative">
                <img
                  src={personalInfo.photo}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-muted"
                />
                <button
                  onClick={() => updatePersonalInfo({ photo: "" })}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] mt-1">Photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          {personalInfo.photo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              Change Photo
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name *</label>
            <Input
              placeholder="John Doe"
              value={personalInfo.fullName}
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              className={showError("fullName") ? "border-destructive" : ""}
            />
            {showError("fullName") && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Professional Title *</label>
            <Input
              placeholder="Senior Software Engineer"
              value={personalInfo.title}
              onChange={(e) => updatePersonalInfo({ title: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              className={showError("title") ? "border-destructive" : ""}
            />
            {showError("title") && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email *
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={personalInfo.email}
              onChange={(e) => updatePersonalInfo({ email: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={showError("email") ? "border-destructive" : ""}
            />
            {showError("email") && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <Input
              placeholder="+1 (555) 123-4567"
              value={personalInfo.phone}
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location
            </label>
            <Input
              placeholder="New York, NY"
              value={personalInfo.location}
              onChange={(e) => updatePersonalInfo({ location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Website
            </label>
            <Input
              placeholder="https://johndoe.com"
              value={personalInfo.website}
              onChange={(e) => updatePersonalInfo({ website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </label>
            <Input
              placeholder="linkedin.com/in/johndoe"
              value={personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Professional Summary</label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={aiLoading !== null}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {aiLoading === "generate" ? "Generating..." : "Generate"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleImprove("summary")}
                disabled={aiLoading !== null || !personalInfo.summary}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {aiLoading === "summary" ? "Improving..." : "Improve"}
              </Button>
            </div>
          </div>
          <Textarea
            placeholder="A brief professional summary highlighting your key strengths and career objectives..."
            rows={4}
            value={personalInfo.summary}
            onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
