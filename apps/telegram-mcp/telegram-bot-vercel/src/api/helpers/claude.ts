import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "./memory";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are a helpful AI assistant chatting via Telegram.
Keep responses concise but helpful.
You can use Telegram-compatible markdown formatting:
- *bold* for bold text
- _italic_ for italic
- \`code\` for inline code
- \`\`\`language
code block
\`\`\`
- [text](url) for links

Be friendly and conversational.`;

export async function generateResponse(
  messages: Message[],
  systemPrompt?: string
): Promise<string> {
  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt || SYSTEM_PROMPT,
      messages: formattedMessages,
    });

    if (response.content[0].type === "text") {
      return response.content[0].text;
    }

    return "I couldn't generate a response.";
  } catch (error: any) {
    console.error("[CLAUDE] API Error:", error.message);
    throw new Error(`Claude API error: ${error.message}`);
  }
}

export async function analyzeImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  prompt: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    if (response.content[0].type === "text") {
      return response.content[0].text;
    }

    return "I couldn't analyze the image.";
  } catch (error: any) {
    console.error("[CLAUDE] Vision API Error:", error.message);
    throw new Error(`Claude Vision error: ${error.message}`);
  }
}
