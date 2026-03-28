"use client"

import type { CVData } from "./types"

export async function generatePDF(data: CVData): Promise<Blob> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ])

  // Create an off-screen container with the CV HTML
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "794px" // A4 width at 96dpi
  container.innerHTML = buildCVHTML(data)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgWidth = 210 // A4 mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pdf = new jsPDF("p", "mm", "a4")

    // Handle multi-page if content is tall
    const pageHeight = 297 // A4 mm
    let position = 0

    if (imgHeight <= pageHeight) {
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight)
    } else {
      let remainingHeight = imgHeight
      while (remainingHeight > 0) {
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
        remainingHeight -= pageHeight
        position -= pageHeight
        if (remainingHeight > 0) pdf.addPage()
      }
    }

    return pdf.output("blob")
  } finally {
    document.body.removeChild(container)
  }
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>")
}

function buildCVHTML(data: CVData): string {
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

  return `
<div style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a1a; padding: 40px; background: white;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 16px;">
    ${personalInfo.photo ? `<img src="${personalInfo.photo}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #bfdbfe; flex-shrink: 0;" />` : ""}
    <div>
    <div style="font-size: 22pt; font-weight: bold;">${esc(personalInfo.fullName || "Your Name")}</div>
    <div style="color: #2563eb; font-size: 12pt; margin-top: 4px;">${esc(personalInfo.title)}</div>
    <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; font-size: 9pt; color: #666;">
      ${personalInfo.email ? `<span>${esc(personalInfo.email)}</span>` : ""}
      ${personalInfo.phone ? `<span>${esc(personalInfo.phone)}</span>` : ""}
      ${personalInfo.location ? `<span>${esc(personalInfo.location)}</span>` : ""}
      ${personalInfo.website ? `<span>${esc(personalInfo.website)}</span>` : ""}
      ${personalInfo.linkedin ? `<span>${esc(personalInfo.linkedin)}</span>` : ""}
    </div>
    </div>
  </div>

  ${personalInfo.summary ? `
    <div style="font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px;">Summary</div>
    <div style="font-size: 9pt; color: #444;">${esc(personalInfo.summary)}</div>
  ` : ""}

  ${experience.length > 0 ? `
    <div style="font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px;">Experience</div>
    ${experience.map(exp => `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-weight: bold;">${esc(exp.position)}</span>
          <span style="font-size: 9pt; color: #888;">${esc(exp.startDate)} — ${exp.current ? "Present" : esc(exp.endDate)}</span>
        </div>
        <div style="font-size: 9pt; color: #2563eb;">${esc(exp.company)}</div>
        ${exp.description ? `<div style="font-size: 9pt; color: #444; margin-top: 3px;">${esc(exp.description)}</div>` : ""}
      </div>
    `).join("")}
  ` : ""}

  ${education.length > 0 ? `
    <div style="font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px;">Education</div>
    ${education.map(edu => `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-weight: bold;">${esc(edu.degree)}${edu.field ? ` — ${esc(edu.field)}` : ""}</span>
          <span style="font-size: 9pt; color: #888;">${esc(edu.startDate)} — ${esc(edu.endDate)}</span>
        </div>
        <div style="font-size: 9pt; color: #2563eb;">${esc(edu.institution)}</div>
        ${edu.description ? `<div style="font-size: 9pt; color: #444; margin-top: 3px;">${esc(edu.description)}</div>` : ""}
      </div>
    `).join("")}
  ` : ""}

  ${skills.length > 0 ? `
    <div style="font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px;">Skills</div>
    ${Object.entries(skillsByCategory).map(([cat, catSkills]) => `
      <div style="font-size: 9pt; color: #444;"><strong>${esc(cat)}:</strong> ${catSkills.map(s => esc(s.name)).join(", ")}</div>
    `).join("")}
  ` : ""}

  ${languages.length > 0 || certifications.length > 0 ? `
    <div style="display: flex; gap: 24px;">
      ${languages.length > 0 ? `
        <div style="flex: 1;">
          <div style="font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px;">Languages</div>
          ${languages.map(l => `
            <div style="display: flex; justify-content: space-between; font-size: 9pt;">
              <span>${esc(l.name)}</span>
              <span style="background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-size: 8pt;">${esc(l.proficiency)}</span>
            </div>
          `).join("")}
        </div>
      ` : ""}
      ${certifications.length > 0 ? `
        <div style="flex: 1;">
          <div style="font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px;">Certifications</div>
          ${certifications.map(c => `
            <div style="font-size: 9pt; color: #444;"><strong>${esc(c.name)}</strong> — ${esc(c.issuer)}${c.date ? ` (${esc(c.date)})` : ""}</div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  ` : ""}

  ${projects.length > 0 ? `
    <div style="font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 8px;">Projects</div>
    ${projects.map(p => `
      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold;">${esc(p.name)}${p.url ? ` <span style="font-size: 9pt; color: #888; font-weight: normal;">${esc(p.url)}</span>` : ""}</div>
        ${p.description ? `<div style="font-size: 9pt; color: #444;">${esc(p.description)}</div>` : ""}
        ${p.technologies.length > 0 ? `<div style="margin-top: 2px;">${p.technologies.map(t => `<span style="display: inline-block; border: 1px solid #e2e8f0; padding: 0 4px; border-radius: 3px; font-size: 8pt; color: #888; margin-right: 4px;">${esc(t)}</span>`).join("")}</div>` : ""}
      </div>
    `).join("")}
  ` : ""}
</div>`
}
