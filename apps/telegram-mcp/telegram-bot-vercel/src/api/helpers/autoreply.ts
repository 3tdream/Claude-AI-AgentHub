import { Redis } from "@upstash/redis";
import { GroupConfig, AutoReplyRule, getGroupConfig, saveGroupConfig } from "./groups";
import { generateResponse } from "./claude";
import type { Message } from "./memory";

const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

let redis: Redis | null = null;
if (IS_PRODUCTION && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface AutoReplyResult {
  shouldReply: boolean;
  response: string | null;
  ruleId: string | null;
  replyType: "keyword" | "mention" | "ai" | null;
}

// ==================== TRIGGER MATCHING ====================

function matchesKeyword(text: string, trigger: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  const triggerWords = trigger.toLowerCase().split(/\s+/);
  return triggerWords.every(tw => words.some(w => w.includes(tw)));
}

function matchesRegex(text: string, pattern: string): boolean {
  try {
    const regex = new RegExp(pattern, "i");
    return regex.test(text);
  } catch {
    return false;
  }
}

function matchesMention(text: string, botUsername: string): boolean {
  const mentionPattern = new RegExp(`@${botUsername}\\b`, "i");
  return mentionPattern.test(text);
}

// ==================== COOLDOWN CHECK ====================

function isOnCooldown(rule: AutoReplyRule): boolean {
  if (rule.cooldownSeconds === 0) return false;
  if (!rule.lastTriggered) return false;

  const elapsed = (Date.now() - rule.lastTriggered) / 1000;
  return elapsed < rule.cooldownSeconds;
}

// ==================== GET CONTEXT FOR AI ====================

async function getRecentMessages(groupId: string, limit: number = 10): Promise<Message[]> {
  if (!redis) return [];

  try {
    const messages = await redis.lrange<Message>(`group:${groupId}:recent`, 0, limit - 1);
    return messages || [];
  } catch (error) {
    console.error("[AUTOREPLY] Error getting recent messages:", error);
    return [];
  }
}

// ==================== MAIN AUTO-REPLY FUNCTION ====================

export async function checkAutoReply(
  groupId: string,
  messageText: string,
  senderName: string,
  botUsername: string = "bot"
): Promise<AutoReplyResult> {
  const config = await getGroupConfig(groupId);

  if (!config || !config.enabled || !config.autoReplyEnabled) {
    return { shouldReply: false, response: null, ruleId: null, replyType: null };
  }

  // Check for bot mention first
  if (config.respondToMentions && matchesMention(messageText, botUsername)) {
    // Remove the mention from the message for processing
    const cleanedMessage = messageText.replace(new RegExp(`@${botUsername}\\s*`, "gi"), "").trim();

    if (config.aiResponseEnabled && cleanedMessage) {
      // Get context and generate AI response
      const recentMessages = await getRecentMessages(groupId, 5);
      const context: Message[] = [
        ...recentMessages,
        { role: "user", content: `[${senderName}]: ${cleanedMessage}`, timestamp: Date.now() },
      ];

      try {
        const aiResponse = await generateResponse(
          context,
          `You are a helpful AI assistant in a Telegram group chat.
Someone mentioned you with a question or request.
Keep responses concise and helpful. Use Telegram-compatible markdown.
Context: You are replying to ${senderName} who said: "${cleanedMessage}"`
        );

        return {
          shouldReply: true,
          response: aiResponse,
          ruleId: null,
          replyType: "mention",
        };
      } catch (error) {
        console.error("[AUTOREPLY] AI error:", error);
        return {
          shouldReply: true,
          response: "Sorry, I couldn't process that request right now.",
          ruleId: null,
          replyType: "mention",
        };
      }
    }

    return {
      shouldReply: true,
      response: "Hi! How can I help?",
      ruleId: null,
      replyType: "mention",
    };
  }

  // Check auto-reply rules
  for (const rule of config.autoReplyRules) {
    if (!rule.enabled) continue;
    if (isOnCooldown(rule)) continue;

    let matches = false;

    switch (rule.triggerType) {
      case "keyword":
        matches = matchesKeyword(messageText, rule.trigger);
        break;
      case "regex":
        matches = matchesRegex(messageText, rule.trigger);
        break;
      case "mention":
        matches = matchesMention(messageText, rule.trigger);
        break;
    }

    if (matches) {
      // Update cooldown
      rule.lastTriggered = Date.now();
      await saveGroupConfig(config);

      // Generate response
      let response: string;

      if (rule.response === "ai" && config.aiResponseEnabled) {
        // AI-generated response
        const recentMessages = await getRecentMessages(groupId, 5);
        const context: Message[] = [
          ...recentMessages,
          { role: "user", content: `[${senderName}]: ${messageText}`, timestamp: Date.now() },
        ];

        try {
          response = await generateResponse(
            context,
            `You are a helpful AI assistant in a Telegram group chat.
A message matched the trigger "${rule.trigger}".
Provide a helpful, contextual response. Keep it concise.
The user ${senderName} said: "${messageText}"`
          );
        } catch (error) {
          console.error("[AUTOREPLY] AI error:", error);
          response = "I understood your message but couldn't generate a response.";
        }
      } else {
        // Static response with variable replacement
        response = rule.response
          .replace("{user}", senderName)
          .replace("{message}", messageText)
          .replace("{time}", new Date().toLocaleTimeString());
      }

      return {
        shouldReply: true,
        response,
        ruleId: rule.id,
        replyType: "keyword",
      };
    }
  }

  return { shouldReply: false, response: null, ruleId: null, replyType: null };
}

// ==================== STORE RECENT MESSAGES ====================

export async function storeRecentMessage(
  groupId: string,
  senderName: string,
  messageText: string,
  maxMessages: number = 100
): Promise<void> {
  if (!redis) return;

  try {
    const message: Message = {
      role: "user",
      content: `[${senderName}]: ${messageText}`,
      timestamp: Date.now(),
    };

    // Add to front of list
    await redis.lpush(`group:${groupId}:recent`, message);
    // Trim to max size
    await redis.ltrim(`group:${groupId}:recent`, 0, maxMessages - 1);
  } catch (error) {
    console.error("[AUTOREPLY] Error storing message:", error);
  }
}

// ==================== FAQ SYSTEM ====================

export interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

export async function getFAQs(groupId: string): Promise<FAQ[]> {
  if (!redis) return [];

  try {
    const faqs = await redis.get<FAQ[]>(`group:${groupId}:faqs`);
    return faqs || [];
  } catch (error) {
    console.error("[AUTOREPLY] Error getting FAQs:", error);
    return [];
  }
}

export async function addFAQ(groupId: string, faq: FAQ): Promise<void> {
  if (!redis) return;

  try {
    const faqs = await getFAQs(groupId);
    faqs.push(faq);
    await redis.set(`group:${groupId}:faqs`, faqs);
  } catch (error) {
    console.error("[AUTOREPLY] Error adding FAQ:", error);
  }
}

export async function removeFAQ(groupId: string, index: number): Promise<void> {
  if (!redis) return;

  try {
    const faqs = await getFAQs(groupId);
    if (index >= 0 && index < faqs.length) {
      faqs.splice(index, 1);
      await redis.set(`group:${groupId}:faqs`, faqs);
    }
  } catch (error) {
    console.error("[AUTOREPLY] Error removing FAQ:", error);
  }
}

export async function findMatchingFAQ(groupId: string, question: string): Promise<FAQ | null> {
  const faqs = await getFAQs(groupId);

  const questionLower = question.toLowerCase();

  for (const faq of faqs) {
    // Check keywords
    for (const keyword of faq.keywords) {
      if (questionLower.includes(keyword.toLowerCase())) {
        return faq;
      }
    }

    // Check question similarity (simple word overlap)
    const faqWords = faq.question.toLowerCase().split(/\s+/);
    const questionWords = questionLower.split(/\s+/);
    const overlap = faqWords.filter(w => questionWords.includes(w)).length;

    if (overlap >= Math.min(3, faqWords.length * 0.5)) {
      return faq;
    }
  }

  return null;
}
