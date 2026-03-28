"use client"

import type { CVData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
} from "lucide-react"

export function TemplateModern({ data }: { data: CVData }) {
  const { personalInfo, experience, education, skills, languages, certifications, projects } = data

  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      const cat = skill.category || "Other"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(skill)
      return acc
    },
    {} as Record<string, typeof skills>
  )

  return (
    <div className="bg-white text-gray-900 p-8 max-w-[210mm] mx-auto shadow-sm text-[11px] leading-relaxed">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-4 mb-6 flex items-start gap-4">
        {personalInfo.photo && (
          <img
            src={personalInfo.photo}
            alt=""
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 flex-shrink-0"
          />
        )}
        <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="text-blue-600 font-medium text-sm mt-1">
          {personalInfo.title || "Professional Title"}
        </p>
        <div className="flex flex-wrap gap-3 mt-3 text-gray-600 text-[10px]">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> {personalInfo.website}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" /> {personalInfo.linkedin}
            </span>
          )}
        </div>
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">
            Summary
          </h2>
          <p className="text-gray-700">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <span className="text-[10px] text-gray-500">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p className="text-blue-600 text-[10px] font-medium">{exp.company}</p>
                {exp.description && (
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h3>
                  <span className="text-[10px] text-gray-500">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
                <p className="text-blue-600 text-[10px] font-medium">{edu.institution}</p>
                {edu.description && (
                  <p className="text-gray-700 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">
            Skills
          </h2>
          <div className="space-y-2">
            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
              <div key={category}>
                <span className="font-medium text-gray-800">{category}: </span>
                <span className="text-gray-700">
                  {catSkills.map((s) => s.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two columns for languages, certifications */}
      <div className="grid grid-cols-2 gap-6">
        {languages.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">
              Languages
            </h2>
            <div className="space-y-1">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between">
                  <span>{lang.name}</span>
                  <Badge variant="secondary" className="text-[9px]">
                    {lang.proficiency}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">
              Certifications
            </h2>
            <div className="space-y-1">
              {certifications.map((cert) => (
                <div key={cert.id}>
                  <span className="font-medium">{cert.name}</span>
                  <span className="text-gray-500 text-[10px]">
                    {" "}— {cert.issuer} {cert.date && `(${cert.date})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                  {proj.url && (
                    <span className="text-[10px] text-blue-600">{proj.url}</span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-gray-700 mt-0.5">{proj.description}</p>
                )}
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-[9px]">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
