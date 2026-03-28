import { Redis } from "@upstash/redis";
import { GroupConfig, ModerationRule, getGroupConfig, saveGroupConfig } from "./groups";
import { generateResponse } from "./claude";

const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

let redis: Redis | null = null;
if (IS_PRODUCTION && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ==================== TYPES ====================

export interface ModerationResult {
  shouldAct: boolean;
  action: "none" | "warn" | "delete" | "mute" | "kick" | "ban";
  reason: string | null;
  ruleId: string | null;
  ruleType: ModerationRule["type"] | null;
}

export interface UserWarning {
  count: number;
  reasons: string[];
  lastWarning: number;
}

// ==================== BAD WORDS LIST ====================

const BAD_WORDS_EN = [
  "spam", "scam", "fuck", "shit", "asshole", "bitch", "nigger", "faggot",
  "cunt", "dick", "cock", "pussy", "whore", "slut", "bastard", "damn",
];

const BAD_WORDS_RU = [
  "хуй", "пизда", "блядь", "сука", "ебать", "мудак", "пидор", "шлюха",
  "залупа", "дрочить", "хер", "жопа", "срать", "ёбаный",
];

const BAD_WORDS = [...BAD_WORDS_EN, ...BAD_WORDS_RU];

// ==================== SPAM DETECTION ====================

interface MessageTimestamp {
  userId: string;
  timestamp: number;
}

async function getRecentMessageTimestamps(groupId: string, userId: string): Promise<number[]> {
  if (!redis) return [];

  try {
    const key = `group:${groupId}:spam:${userId}`;
    const timestamps = await redis.lrange<number>(key, 0, 19);
    return timestamps || [];
  } catch (error) {
    console.error("[MODERATION] Error getting timestamps:", error);
    return [];
  }
}

async function addMessageTimestamp(groupId: string, userId: string): Promise<void> {
  if (!redis) return;

  try {
    const key = `group:${groupId}:spam:${userId}`;
    const now = Date.now();
    await redis.lpush(key, now);
    await redis.ltrim(key, 0, 19);
    await redis.expire(key, 120); // Expire after 2 minutes
  } catch (error) {
    console.error("[MODERATION] Error adding timestamp:", error);
  }
}

function isSpamming(timestamps: number[], threshold: number): boolean {
  const oneMinuteAgo = Date.now() - 60000;
  const recentCount = timestamps.filter(t => t > oneMinuteAgo).length;
  return recentCount >= threshold;
}

// ==================== CAPS LOCK DETECTION ====================

function getCapsPercentage(text: string): number {
  const letters = text.replace(/[^a-zA-Zа-яА-Я]/g, "");
  if (letters.length < 5) return 0;

  const caps = letters.replace(/[^A-ZА-Я]/g, "").length;
  return (caps / letters.length) * 100;
}

// ==================== BAD LANGUAGE DETECTION ====================

function containsBadLanguage(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
}

// ==================== LINK DETECTION ====================

function containsLinks(text: string): boolean {
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+|t\.me\/[^\s]+/gi;
  return urlPattern.test(text);
}

// ==================== CUSTOM PATTERN DETECTION ====================

function matchesCustomPattern(text: string, pattern: string): boolean {
  try {
    const regex = new RegExp(pattern, "gi");
    return regex.test(text);
  } catch {
    return false;
  }
}

// ==================== AI CONTENT MODERATION ====================

async function analyzeContentWithAI(text: string, senderName: string): Promise<{
  isViolation: boolean;
  reason: string | null;
  severity: "low" | "medium" | "high";
}> {
  try {
    const prompt = `Analyze this message for content moderation. Check for:
1. Hate speech or discrimination
2. Threats or violence
3. Harassment or bullying
4. Explicit adult content
5. Scam or phishing attempts
6. Crypto/investment scams

Message from ${senderName}: "${text}"

Respond in JSON format only:
{"isViolation": true/false, "reason": "brief reason or null", "severity": "low/medium/high"}`;

    const response = await generateResponse(
      [{ role: "user", content: prompt, timestamp: Date.now() }],
      "You are a content moderation AI. Respond only with valid JSON."
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { isViolation: false, reason: null, severity: "low" };
  } catch (error) {
    console.error("[MODERATION] AI analysis error:", error);
    return { isViolation: false, reason: null, severity: "low" };
  }
}

// ==================== USER WARNINGS ====================

export async function getUserWarnings(groupId: string, userId: string): Promise<UserWarning> {
  if (!redis) return { count: 0, reasons: [], lastWarning: 0 };

  try {
    const warning = await redis.get<UserWarning>(`group:${groupId}:warnings:${userId}`);
    return warning || { count: 0, reasons: [], lastWarning: 0 };
  } catch (error) {
    console.error("[MODERATION] Error getting warnings:", error);
    return { count: 0, reasons: [], lastWarning: 0 };
  }
}

export async function addUserWarning(
  groupId: string,
  userId: string,
  reason: string
): Promise<number> {
  if (!redis) return 0;

  try {
    const current = await getUserWarnings(groupId, userId);
    const updated: UserWarning = {
      count: current.count + 1,
      reasons: [...current.reasons.slice(-4), reason], // Keep last 5 reasons
      lastWarning: Date.now(),
    };

    await redis.set(`group:${groupId}:warnings:${userId}`, updated);
    await redis.expire(`group:${groupId}:warnings:${userId}`, 86400 * 7); // 7 days

    return updated.count;
  } catch (error) {
    console.error("[MODERATION] Error adding warning:", error);
    return 0;
  }
}

export async function clearUserWarnings(groupId: string, userId: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(`group:${groupId}:warnings:${userId}`);
  } catch (error) {
    console.error("[MODERATION] Error clearing warnings:", error);
  }
}

// ==================== MAIN MODERATION FUNCTION ====================

export async function checkModeration(
  groupId: string,
  userId: string,
  messageText: string,
  senderName: string
): Promise<ModerationResult> {
  const config = await getGroupConfig(groupId);

  if (!config || !config.enabled || !config.moderationEnabled) {
    return { shouldAct: false, action: "none", reason: null, ruleId: null, ruleType: null };
  }

  // Track message for spam detection
  await addMessageTimestamp(groupId, userId);

  for (const rule of config.moderationRules) {
    if (!rule.enabled) continue;

    let isViolation = false;
    let reason: string | null = null;

    switch (rule.type) {
      case "spam":
        const timestamps = await getRecentMessageTimestamps(groupId, userId);
        if (isSpamming(timestamps, rule.threshold || 5)) {
          isViolation = true;
          reason = `Spam detected: ${timestamps.length} messages in last minute`;
        }
        break;

      case "caps":
        const capsPercent = getCapsPercentage(messageText);
        if (capsPercent >= (rule.threshold || 70)) {
          isViolation = true;
          reason = `Excessive caps: ${Math.round(capsPercent)}%`;
        }
        break;

      case "language":
        if (containsBadLanguage(messageText)) {
          isViolation = true;
          reason = "Bad language detected";
        }
        break;

      case "links":
        if (containsLinks(messageText)) {
          isViolation = true;
          reason = "Links are not allowed";
        }
        break;

      case "custom":
        if (rule.pattern && matchesCustomPattern(messageText, rule.pattern)) {
          isViolation = true;
          reason = `Matched prohibited pattern: ${rule.pattern}`;
        }
        break;
    }

    if (isViolation) {
      // Determine action based on warnings
      let action = rule.action;

      if (config.warnBeforeAction && action !== "warn") {
        const warnings = await getUserWarnings(groupId, userId);

        if (warnings.count < config.maxWarnings) {
          await addUserWarning(groupId, userId, reason || "Rule violation");
          return {
            shouldAct: true,
            action: "warn",
            reason: `${reason} (Warning ${warnings.count + 1}/${config.maxWarnings})`,
            ruleId: rule.id,
            ruleType: rule.type,
          };
        }
      }

      return {
        shouldAct: true,
        action,
        reason,
        ruleId: rule.id,
        ruleType: rule.type,
      };
    }
  }

  return { shouldAct: false, action: "none", reason: null, ruleId: null, ruleType: null };
}

// ==================== AI-ENHANCED MODERATION ====================

export async function checkModerationWithAI(
  groupId: string,
  userId: string,
  messageText: string,
  senderName: string
): Promise<ModerationResult> {
  // First run basic moderation
  const basicResult = await checkModeration(groupId, userId, messageText, senderName);

  if (basicResult.shouldAct) {
    return basicResult;
  }

  // Then run AI analysis for content that passed basic checks
  const config = await getGroupConfig(groupId);
  if (!config || !config.aiResponseEnabled) {
    return basicResult;
  }

  // Only use AI for longer messages (efficiency)
  if (messageText.length < 20) {
    return basicResult;
  }

  const aiResult = await analyzeContentWithAI(messageText, senderName);

  if (aiResult.isViolation) {
    let action: ModerationResult["action"] = "warn";

    if (aiResult.severity === "high") {
      action = "delete";
    } else if (aiResult.severity === "medium") {
      const warnings = await getUserWarnings(groupId, userId);
      if (warnings.count >= (config.maxWarnings || 3)) {
        action = "mute";
      }
    }

    return {
      shouldAct: true,
      action,
      reason: aiResult.reason || "AI detected content violation",
      ruleId: null,
      ruleType: null,
    };
  }

  return { shouldAct: false, action: "none", reason: null, ruleId: null, ruleType: null };
}

// ==================== MODERATION ACTIONS ====================

export interface ModerationAction {
  success: boolean;
  message: string;
}

export async function executeModeration(
  action: ModerationResult["action"],
  chatId: string,
  messageId: number,
  userId: string,
  botToken: string
): Promise<ModerationAction> {
  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  try {
    switch (action) {
      case "delete":
        await fetch(`${baseUrl}/deleteMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
        });
        return { success: true, message: "Message deleted" };

      case "mute":
        // Restrict user for 1 hour
        const untilDate = Math.floor(Date.now() / 1000) + 3600;
        await fetch(`${baseUrl}/restrictChatMember`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: userId,
            until_date: untilDate,
            permissions: {
              can_send_messages: false,
              can_send_media_messages: false,
              can_send_other_messages: false,
            },
          }),
        });
        return { success: true, message: "User muted for 1 hour" };

      case "kick":
        await fetch(`${baseUrl}/banChatMember`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, user_id: userId }),
        });
        // Immediately unban so they can rejoin
        await fetch(`${baseUrl}/unbanChatMember`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, user_id: userId, only_if_banned: true }),
        });
        return { success: true, message: "User kicked" };

      case "ban":
        await fetch(`${baseUrl}/banChatMember`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, user_id: userId }),
        });
        return { success: true, message: "User banned" };

      default:
        return { success: true, message: "No action taken" };
    }
  } catch (error) {
    console.error("[MODERATION] Action error:", error);
    return { success: false, message: `Failed to execute action: ${error}` };
  }
}
