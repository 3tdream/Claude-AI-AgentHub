import Anthropic from "@anthropic-ai/sdk";
import {
  detectLanguage,
  matchesIntent,
  findBestIntent,
  extractSubject,
  translateToEnglish,
  needsTranslation,
  SupportedLanguage,
} from "./language";

// ==================== INTENT TYPES ====================

export type IntentType =
  | "generate_image"
  | "chat"
  | "help"
  | "clear_history"
  | "get_stats"
  | "admin_command"
  | "unknown";

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  extractedPrompt?: string;  // For image generation (always in English)
  originalText: string;
  detectedLanguage?: SupportedLanguage;
  matchMethod: "pattern" | "claude" | "fallback";
}

/**
 * Try to match intent using keyword dictionaries (no API call)
 * Uses the language module for multilingual support
 * Returns null if no confident match found
 */
export function matchQuickPattern(text: string): IntentResult | null {
  const trimmed = text.trim();

  // Detect language first
  const langResult = detectLanguage(trimmed);
  const language = langResult.language;

  console.log(`[INTENT] Detected language: ${language} (${langResult.confidence})`);

  // Use keyword-based matching from language module
  const { intent, score } = findBestIntent(trimmed);

  // Require minimum score for confidence
  if (score < 3) {
    return null; // Not enough keyword matches
  }

  // Map intent string to IntentType
  const intentType = intent as IntentType;

  // For image generation, extract and translate the subject
  if (intentType === "generate_image") {
    let prompt = extractSubject(trimmed, language);

    // Translate to English if needed for better image generation
    if (needsTranslation(prompt)) {
      prompt = translateToEnglish(prompt, language);
      console.log(`[INTENT] Translated prompt: "${prompt}"`);
    }

    return {
      intent: "generate_image",
      confidence: Math.min(0.95, 0.7 + score * 0.05),
      extractedPrompt: prompt,
      originalText: text,
      detectedLanguage: language,
      matchMethod: "pattern",
    };
  }

  // For other intents
  if (matchesIntent(trimmed, intentType as any, language)) {
    return {
      intent: intentType,
      confidence: Math.min(0.95, 0.7 + score * 0.05),
      originalText: text,
      detectedLanguage: language,
      matchMethod: "pattern",
    };
  }

  // No confident match found
  return null;
}

// ==================== CLAUDE-BASED CLASSIFICATION ====================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CLASSIFICATION_PROMPT = `You are a multilingual intent classifier for a Telegram bot.
You understand English, Russian (русский), and Hebrew (עברית).
Classify the user's message into one of these intents:

INTENTS:
- generate_image: User wants to create/generate/make an AI image, picture, art, illustration
- help: User wants to know what the bot can do, asking for help or commands
- clear_history: User wants to clear/reset/forget the conversation history
- get_stats: User wants to see statistics or usage info
- chat: General conversation, questions, or anything else

IMPORTANT: Extract the image_prompt in ENGLISH for best image generation results.
If user writes in Russian/Hebrew, translate the subject to English.

OUTPUT FORMAT (JSON only, no explanation):
{"intent": "intent_name", "confidence": 0.0-1.0, "image_prompt": "extracted prompt IN ENGLISH"}

Examples:
- "hey can you make me an epic dragon battle?" -> {"intent": "generate_image", "confidence": 0.95, "image_prompt": "epic dragon battle"}
- "нарисуй мне кошку" -> {"intent": "generate_image", "confidence": 0.95, "image_prompt": "cat"}
- "צייר לי חתול" -> {"intent": "generate_image", "confidence": 0.95, "image_prompt": "cat"}
- "сделай картинку заката над морем" -> {"intent": "generate_image", "confidence": 0.95, "image_prompt": "sunset over the sea"}
- "what's the weather like?" -> {"intent": "chat", "confidence": 0.9}
- "как дела?" -> {"intent": "chat", "confidence": 0.9}
- "מה שלומך?" -> {"intent": "chat", "confidence": 0.9}
- "forget our chat please" -> {"intent": "clear_history", "confidence": 0.9}
- "забудь наш разговор" -> {"intent": "clear_history", "confidence": 0.9}
- "שכח את השיחה" -> {"intent": "clear_history", "confidence": 0.9}
- "how do I use this bot?" -> {"intent": "help", "confidence": 0.95}
- "что ты умеешь?" -> {"intent": "help", "confidence": 0.95}
- "מה אתה יכול לעשות?" -> {"intent": "help", "confidence": 0.95}

USER MESSAGE:`;

/**
 * Use Claude Haiku for fast, cheap intent classification
 * Only called when pattern matching fails
 */
export async function classifyWithClaude(text: string): Promise<IntentResult> {
  // Detect language for the result
  const langResult = detectLanguage(text);

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",  // Fast and cheap for classification
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `${CLASSIFICATION_PROMPT}\n"${text}"`,
        },
      ],
    });

    if (response.content[0].type !== "text") {
      throw new Error("Unexpected response type");
    }

    const responseText = response.content[0].text.trim();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      intent: parsed.intent as IntentType,
      confidence: parsed.confidence || 0.7,
      extractedPrompt: parsed.image_prompt,
      originalText: text,
      detectedLanguage: langResult.language,
      matchMethod: "claude",
    };
  } catch (error) {
    console.error("[INTENT] Claude classification failed:", error);
    // Fallback to chat intent
    return {
      intent: "chat",
      confidence: 0.5,
      originalText: text,
      detectedLanguage: langResult.language,
      matchMethod: "fallback",
    };
  }
}

// ==================== MAIN INTENT DETECTION ====================

const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Detect user intent using hybrid approach:
 * 1. Try quick pattern matching (free, fast)
 * 2. Fall back to Claude Haiku if needed (cheap, still fast)
 * 3. Default to chat if confidence is low
 */
export async function detectIntent(text: string): Promise<IntentResult> {
  // Step 1: Try quick pattern matching
  const quickMatch = matchQuickPattern(text);
  if (quickMatch && quickMatch.confidence >= CONFIDENCE_THRESHOLD) {
    console.log(`[INTENT] Quick match: ${quickMatch.intent} (${quickMatch.confidence})`);
    return quickMatch;
  }

  // Step 2: Use Claude for complex cases
  const claudeResult = await classifyWithClaude(text);

  // Step 3: Apply confidence threshold
  if (claudeResult.confidence < CONFIDENCE_THRESHOLD) {
    console.log(`[INTENT] Low confidence (${claudeResult.confidence}), defaulting to chat`);
    return {
      intent: "chat",
      confidence: claudeResult.confidence,
      originalText: text,
      matchMethod: "fallback",
    };
  }

  console.log(`[INTENT] Claude classified: ${claudeResult.intent} (${claudeResult.confidence})`);
  return claudeResult;
}

/**
 * Check if the detected intent should proceed with image generation
 */
export function shouldGenerateImage(result: IntentResult): boolean {
  return result.intent === "generate_image" &&
         result.confidence >= CONFIDENCE_THRESHOLD &&
         !!result.extractedPrompt;
}
