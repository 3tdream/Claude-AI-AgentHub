"use client"

import type { CVData } from "@/lib/types"

export function TemplateMinimal({ data }: { data: CVData }) {
  const { personalInfo, experience, education, skills, languages, certifications, projects } = data

  return (
    <div className="bg-white text-gray-800 p-8 max-w-[210mm] mx-auto shadow-sm text-[11px] leading-relaxed">
      {/* Header - Minimal */}
      <div className="mb-6">
        <h1 className="text-xl font-light tracking-wide">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="text-gray-500 text-sm">{personalInfo.title}</p>
        <div className="flex flex-wrap gap-x-3 mt-2 text-[10px] text-gray-400">
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
          <p className="text-gray-600">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[120px_1fr] gap-4">
                <div className="text-[10px] text-gray-400">
                  {exp.startDate}
                  <br />
                  {exp.current ? "Present" : exp.endDate}
                </div>
                <div>
                  <h3 className="font-medium">{exp.position}</h3>
                  <p className="text-gray-500 text-[10px]">{exp.company}</p>
                  {exp.description && (
                    <p className="text-gray-600 mt-1 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-[120px_1fr] gap-4">
                <div className="text-[10px] text-gray-400">
                  {edu.startDate}
                  <br />
                  {edu.endDate}
                </div>
                <div>
                  <h3 className="font-medium">
                    {edu.degree} {edu.field && `— ${edu.field}`}
                  </h3>
                  <p className="text-gray-500 text-[10px]">{edu.institution}</p>
                  {edu.description && (
                    <p className="text-gray-600 mt-1">{edu.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
            Skills
          </h2>
          <p className="text-gray-600">
            {skills.map((s) => s.name).join(" · ")}
          </p>
        </div>
      )}

      {/* Languages & Certs inline */}
      <div className="grid grid-cols-2 gap-6">
        {languages.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
              Languages
            </h2>
            <div className="space-y-0.5">
              {languages.map((lang) => (
                <p key={lang.id} className="text-gray-600">
                  {lang.name}{" "}
                  <span className="text-gray-400 text-[10px]">
                    ({lang.proficiency})
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
              Certifications
            </h2>
            <div className="space-y-0.5">
              {certifications.map((cert) => (
                <p key={cert.id} className="text-gray-600">
                  {cert.name}
                  <span className="text-gray-400 text-[10px]">
                    {" "}— {cert.issuer}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mt-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <h3 className="font-medium">
                  {proj.name}
                  {proj.url && (
                    <span className="text-gray-400 text-[10px] font-normal ml-2">
                      {proj.url}
                    </span>
                  )}
                </h3>
                {proj.description && (
                  <p className="text-gray-600">{proj.description}</p>
                )}
                {proj.technologies.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {proj.technologies.join(" · ")}
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
