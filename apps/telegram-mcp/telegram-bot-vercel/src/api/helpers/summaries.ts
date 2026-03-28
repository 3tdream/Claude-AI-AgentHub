import { Redis } from "@upstash/redis";
import { getGroupConfig, GroupConfig } from "./groups";
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

export interface GroupMessage {
  messageId: number;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  hasMedia?: boolean;
  mediaType?: string;
  replyTo?: number;
}

export interface DailySummary {
  groupId: string;
  date: string; // YYYY-MM-DD
  messageCount: number;
  activeUsers: string[];
  topTopics: string[];
  summary: string;
  highlights: string[];
  generatedAt: number;
}

// ==================== MESSAGE LOGGING ====================

export async function logGroupMessage(
  groupId: string,
  message: GroupMessage
): Promise<void> {
  if (!redis) return;

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const key = `group:${groupId}:messages:${today}`;

    // Add message to today's list
    await redis.lpush(key, message);

    // Set expiry to 7 days (for weekly summaries)
    await redis.expire(key, 86400 * 7);

    // Also track in a sorted set for quick stats
    await redis.zincrby(`group:${groupId}:user_activity:${today}`, 1, message.userName);
    await redis.expire(`group:${groupId}:user_activity:${today}`, 86400 * 7);
  } catch (error) {
    console.error("[SUMMARIES] Error logging message:", error);
  }
}

export async function getGroupMessages(
  groupId: string,
  date: string
): Promise<GroupMessage[]> {
  if (!redis) return [];

  try {
    const key = `group:${groupId}:messages:${date}`;
    const messages = await redis.lrange<GroupMessage>(key, 0, -1);
    return messages || [];
  } catch (error) {
    console.error("[SUMMARIES] Error getting messages:", error);
    return [];
  }
}

export async function getMessagesForPeriod(
  groupId: string,
  startDate: Date,
  endDate: Date
): Promise<GroupMessage[]> {
  if (!redis) return [];

  const messages: GroupMessage[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const dayMessages = await getGroupMessages(groupId, dateStr);
    messages.push(...dayMessages);
    current.setDate(current.getDate() + 1);
  }

  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

// ==================== ACTIVITY STATS ====================

export async function getDailyStats(
  groupId: string,
  date: string
): Promise<{ messageCount: number; activeUsers: string[] }> {
  if (!redis) return { messageCount: 0, activeUsers: [] };

  try {
    const messages = await getGroupMessages(groupId, date);
    const userActivity = await redis.zrange<string[]>(
      `group:${groupId}:user_activity:${date}`,
      0,
      -1,
      { rev: true }
    );

    return {
      messageCount: messages.length,
      activeUsers: userActivity || [],
    };
  } catch (error) {
    console.error("[SUMMARIES] Error getting stats:", error);
    return { messageCount: 0, activeUsers: [] };
  }
}

// ==================== SUMMARY GENERATION ====================

export async function generateDailySummary(
  groupId: string,
  date?: string
): Promise<DailySummary | null> {
  const config = await getGroupConfig(groupId);
  if (!config || !config.summariesEnabled) return null;

  const targetDate = date || new Date().toISOString().split("T")[0];
  const messages = await getGroupMessages(groupId, targetDate);

  if (messages.length === 0) {
    return null;
  }

  // Prepare conversation for Claude
  const conversationText = messages
    .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.userName}: ${m.text}`)
    .join("\n");

  const language = config.summaryLanguage || "en";
  const languageInstruction = language === "ru"
    ? "Respond in Russian."
    : language === "he"
      ? "Respond in Hebrew."
      : "Respond in English.";

  try {
    const prompt = `Analyze this group chat conversation and provide a summary.

Conversation from ${targetDate}:
---
${conversationText.substring(0, 8000)} ${conversationText.length > 8000 ? "... (truncated)" : ""}
---

Provide a JSON response with:
1. "summary": A brief 2-3 sentence summary of the main discussion
2. "topics": Array of 3-5 main topics discussed
3. "highlights": Array of 3-5 notable messages or decisions
4. "sentiment": Overall group sentiment (positive/neutral/negative)

${languageInstruction}

Respond with valid JSON only.`;

    const response = await generateResponse(
      [{ role: "user", content: prompt, timestamp: Date.now() }],
      "You are a chat summarization AI. Respond only with valid JSON."
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const uniqueUsers = [...new Set(messages.map(m => m.userName))];

    const summary: DailySummary = {
      groupId,
      date: targetDate,
      messageCount: messages.length,
      activeUsers: uniqueUsers,
      topTopics: parsed.topics || [],
      summary: parsed.summary || "No summary available",
      highlights: parsed.highlights || [],
      generatedAt: Date.now(),
    };

    // Store the summary
    if (redis) {
      await redis.set(`group:${groupId}:summary:${targetDate}`, summary);
      await redis.expire(`group:${groupId}:summary:${targetDate}`, 86400 * 30); // 30 days
    }

    return summary;
  } catch (error) {
    console.error("[SUMMARIES] Error generating summary:", error);
    return null;
  }
}

export async function generateWeeklySummary(groupId: string): Promise<DailySummary | null> {
  const config = await getGroupConfig(groupId);
  if (!config || !config.summariesEnabled) return null;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const messages = await getMessagesForPeriod(groupId, startDate, endDate);

  if (messages.length === 0) {
    return null;
  }

  // Group messages by day for summary
  const messagesByDay = messages.reduce((acc, m) => {
    const day = new Date(m.timestamp).toISOString().split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {} as Record<string, GroupMessage[]>);

  const dayOverviews = Object.entries(messagesByDay)
    .map(([day, msgs]) => {
      const users = [...new Set(msgs.map(m => m.userName))];
      return `${day}: ${msgs.length} messages from ${users.length} users`;
    })
    .join("\n");

  const language = config.summaryLanguage || "en";
  const languageInstruction = language === "ru"
    ? "Respond in Russian."
    : language === "he"
      ? "Respond in Hebrew."
      : "Respond in English.";

  try {
    // Sample messages for summary (to avoid token limits)
    const sampledMessages = messages
      .filter((_, i) => i % Math.max(1, Math.floor(messages.length / 100)) === 0)
      .slice(0, 100);

    const conversationSample = sampledMessages
      .map(m => `[${new Date(m.timestamp).toLocaleDateString()}] ${m.userName}: ${m.text}`)
      .join("\n");

    const prompt = `Create a weekly summary for this Telegram group.

Activity overview:
${dayOverviews}

Sample of conversations:
---
${conversationSample.substring(0, 6000)}
---

Provide a JSON response with:
1. "summary": A comprehensive weekly summary (3-5 sentences)
2. "topics": Array of 5-7 main topics of the week
3. "highlights": Array of 5-7 key moments or decisions
4. "mostActive": Names of most active participants
5. "trends": Any notable trends or patterns

${languageInstruction}

Respond with valid JSON only.`;

    const response = await generateResponse(
      [{ role: "user", content: prompt, timestamp: Date.now() }],
      "You are a chat summarization AI. Respond only with valid JSON."
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const uniqueUsers = [...new Set(messages.map(m => m.userName))];
    const weekId = `week-${startDate.toISOString().split("T")[0]}`;

    const summary: DailySummary = {
      groupId,
      date: weekId,
      messageCount: messages.length,
      activeUsers: uniqueUsers,
      topTopics: parsed.topics || [],
      summary: parsed.summary || "No summary available",
      highlights: parsed.highlights || [],
      generatedAt: Date.now(),
    };

    if (redis) {
      await redis.set(`group:${groupId}:summary:${weekId}`, summary);
      await redis.expire(`group:${groupId}:summary:${weekId}`, 86400 * 60); // 60 days
    }

    return summary;
  } catch (error) {
    console.error("[SUMMARIES] Error generating weekly summary:", error);
    return null;
  }
}

// ==================== GET STORED SUMMARIES ====================

export async function getStoredSummary(
  groupId: string,
  date: string
): Promise<DailySummary | null> {
  if (!redis) return null;

  try {
    return await redis.get<DailySummary>(`group:${groupId}:summary:${date}`);
  } catch (error) {
    console.error("[SUMMARIES] Error getting summary:", error);
    return null;
  }
}

export async function getRecentSummaries(
  groupId: string,
  count: number = 7
): Promise<DailySummary[]> {
  if (!redis) return [];

  const summaries: DailySummary[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const summary = await getStoredSummary(groupId, dateStr);
    if (summary) {
      summaries.push(summary);
    }
  }

  return summaries;
}

// ==================== FORMAT SUMMARY FOR TELEGRAM ====================

export function formatSummaryForTelegram(summary: DailySummary): string {
  const date = summary.date.startsWith("week-")
    ? `Weekly Summary (${summary.date.replace("week-", "")})`
    : `Daily Summary - ${summary.date}`;

  let text = `📊 *${date}*\n\n`;
  text += `📝 *Summary:*\n${summary.summary}\n\n`;
  text += `💬 Messages: ${summary.messageCount}\n`;
  text += `👥 Active Users: ${summary.activeUsers.length}\n\n`;

  if (summary.topTopics.length > 0) {
    text += `🏷️ *Topics:*\n`;
    summary.topTopics.forEach(topic => {
      text += `• ${topic}\n`;
    });
    text += "\n";
  }

  if (summary.highlights.length > 0) {
    text += `✨ *Highlights:*\n`;
    summary.highlights.slice(0, 5).forEach(h => {
      text += `• ${h}\n`;
    });
  }

  return text;
}

// ==================== SCHEDULED SUMMARY CHECK ====================

export async function checkAndSendScheduledSummaries(
  botToken: string,
  adminChatId?: string
): Promise<void> {
  if (!redis) return;

  try {
    // Get all groups
    const keys = await redis.keys("group:*:config");

    for (const key of keys) {
      const config = await redis.get<GroupConfig>(key);
      if (!config || !config.summariesEnabled) continue;

      const now = new Date();
      const hour = now.getHours();

      // Check if it's time for daily summary (default: 21:00)
      if (config.summarySchedule === "daily" && hour === 21) {
        const summary = await generateDailySummary(config.groupId);
        if (summary) {
          const text = formatSummaryForTelegram(summary);
          await sendTelegramMessage(botToken, config.groupId, text);
        }
      }

      // Check if it's time for weekly summary (Sunday 20:00)
      if (config.summarySchedule === "weekly" && now.getDay() === 0 && hour === 20) {
        const summary = await generateWeeklySummary(config.groupId);
        if (summary) {
          const text = formatSummaryForTelegram(summary);
          await sendTelegramMessage(botToken, config.groupId, text);
        }
      }
    }
  } catch (error) {
    console.error("[SUMMARIES] Error in scheduled check:", error);
  }
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("[SUMMARIES] Error sending message:", error);
  }
}
