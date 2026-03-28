export async function aiImproveText(text: string): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "improve", text }),
  })
  if (!res.ok) throw new Error("AI request failed")
  const data = await res.json()
  return data.result
}

export async function aiGenerateSummary(
  experience: string,
  title: string
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "summary", text: experience, title }),
  })
  if (!res.ok) throw new Error("AI request failed")
  const data = await res.json()
  return data.result
}

export async function aiTailorForJob(
  cvContent: string,
  jobDescription: string
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "tailor",
      text: cvContent,
      jobDescription,
    }),
  })
  if (!res.ok) throw new Error("AI request failed")
  const data = await res.json()
  return data.result
}
