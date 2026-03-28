import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Add ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
      )
    }

    const anthropic = new Anthropic()
    const { action, text, title, jobDescription } = await req.json()

    let prompt = ""

    switch (action) {
      case "improve":
        prompt = `Improve the following CV/resume text. Make it more professional, concise, and impactful. Use strong action verbs. Keep it under 100 words. Return only the improved text, no explanations.\n\nText:\n${text}`
        break

      case "summary":
        prompt = `Generate a professional summary for a CV/resume. The person's title is "${title || "Professional"}". Their experience:\n${text}\n\nWrite a compelling 2-3 sentence professional summary. Return only the summary text.`
        break

      case "tailor":
        prompt = `I have the following CV content:\n${text}\n\nAnd this job description:\n${jobDescription}\n\nRewrite my professional summary to be tailored for this specific job. Keep it 2-3 sentences. Highlight relevant skills and experience. Return only the tailored summary.`
        break

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    })

    const content = message.content[0]
    const result = content.type === "text" ? content.text : ""

    return NextResponse.json({ result })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    )
  }
}
