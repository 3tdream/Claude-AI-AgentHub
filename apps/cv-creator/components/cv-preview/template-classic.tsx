"use client"

import type { CVData } from "@/lib/types"

export function TemplateClassic({ data }: { data: CVData }) {
  const { personalInfo, experience, education, skills, languages, certifications, projects } = data

  return (
    <div className="bg-white text-gray-900 p-8 max-w-[210mm] mx-auto shadow-sm text-[11px] leading-relaxed font-serif">
      {/* Header - Centered */}
      <div className="text-center border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-wide uppercase">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="text-gray-600 mt-1">
          {personalInfo.title || "Professional Title"}
        </p>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-gray-700 italic">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{exp.position}</h3>
                    <p className="italic text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
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
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">
                      {edu.degree} {edu.field && `— ${edu.field}`}
                    </h3>
                    <p className="italic text-gray-600">{edu.institution}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
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
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
            Skills
          </h2>
          <p className="text-gray-700">
            {skills.map((s) => s.name).join(" | ")}
          </p>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
            Languages
          </h2>
          <p className="text-gray-700">
            {languages.map((l) => `${l.name} (${l.proficiency})`).join(" | ")}
          </p>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
            Certifications
          </h2>
          <div className="space-y-1">
            {certifications.map((cert) => (
              <p key={cert.id}>
                <span className="font-semibold">{cert.name}</span> — {cert.issuer}
                {cert.date && ` (${cert.date})`}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-bold">
                  {proj.name}
                  {proj.url && (
                    <span className="font-normal text-gray-500 text-[10px] ml-2">
                      {proj.url}
                    </span>
                  )}
                </h3>
                {proj.description && (
                  <p className="text-gray-700">{proj.description}</p>
                )}
                {proj.technologies.length > 0 && (
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Technologies: {proj.technologies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
