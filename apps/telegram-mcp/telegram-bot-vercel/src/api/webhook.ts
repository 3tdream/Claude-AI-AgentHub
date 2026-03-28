import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  addMessage,
  clearChatHistory,
  getMemoryStats,
  checkMemoryLimit,
  cleanupOldChats,
  checkUpstashUsage,
  trackBandwidth,
} from "./helpers/memory";
import { generateResponse, analyzeImage } from "./helpers/claude";
import { checkAutoReply, storeRecentMessage } from "./helpers/autoreply";
import { checkModerationWithAI, executeModeration, getUserWarnings, clearUserWarnings } from "./helpers/moderation";
import { logGroupMessage, generateDailySummary, generateWeeklySummary, formatSummaryForTelegram, getStoredSummary } from "./helpers/summaries";
import { getOrCreateGroupConfig, updateGroupConfig, isGroupAdmin, addGroupAdmin, listAllGroups, addAutoReplyRule, removeAutoReplyRule } from "./helpers/groups";
import { trackUser, updateUserLastResponse, getUsersStats, formatUsersForTelegram, getUser, TelegramUser, TrackUserResult } from "./helpers/users";
import { generateImage } from "./helpers/fal";
import {
  routeTextMessage,
  routeVoiceMessage,
  routePhotoMessage,
  isLegacyCommand,
  parseLegacyCommand,
  MessageContext,
  RouteResult,
} from "./helpers/router";
import { formatTranscriptionFeedback } from "./helpers/voice";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_USER_ID = process.env.ALLOWED_USER_ID;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || ALLOWED_USER_ID;
const BOT_USERNAME = process.env.BOT_USERNAME || "bot";

// ==================== TELEGRAM API HELPERS ====================

async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  parseMode?: "Markdown" | "HTML",
  replyToMessageId?: number
): Promise<void> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const maxLength = 4000;
  const chunks = text.match(new RegExp(`.{1,${maxLength}}`, "gs")) || [text];

  for (const chunk of chunks) {
    try {
      const body: any = {
        chat_id: chatId,
        text: chunk,
      };
      if (parseMode) body.parse_mode = parseMode;
      if (replyToMessageId) body.reply_to_message_id = replyToMessageId;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!result.ok && parseMode) {
        // Retry without parse_mode if markdown fails
        delete body.parse_mode;
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
    } catch (error) {
      console.error("[TELEGRAM] Send error:", error);
    }
  }
}

async function sendTypingAction(chatId: number | string): Promise<void> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      action: "typing",
    }),
  });
}

async function sendUploadPhotoAction(chatId: number | string): Promise<void> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      action: "upload_photo",
    }),
  });
}

async function sendTelegramPhoto(
  chatId: number | string,
  photoUrl: string,
  caption?: string,
  replyToMessageId?: number
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  try {
    const body: any = {
      chat_id: chatId,
      photo: photoUrl,
    };
    if (caption) body.caption = caption;
    if (replyToMessageId) body.reply_to_message_id = replyToMessageId;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("[TELEGRAM] Send photo error:", error);
    return false;
  }
}

async function getFileUrl(fileId: string): Promise<string> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getFile`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = await response.json();
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
}

async function deleteMessage(chatId: number | string, messageId: number): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    });
    const result = await response.json();
    return result.ok;
  } catch {
    return false;
  }
}

// ==================== USER CHECKS ====================

function isUserAllowed(userId: number): boolean {
  // Bot is now public - all users can interact
  // To restrict again, set ALLOWED_USER_ID env var and change this to:
  // if (!ALLOWED_USER_ID) return true;
  // return userId.toString() === ALLOWED_USER_ID;
  return true;
}

function isAdmin(userId: number): boolean {
  if (!ADMIN_USER_ID) return false;
  return userId.toString() === ADMIN_USER_ID;
}

function isGroupChat(chatType: string): boolean {
  return chatType === "group" || chatType === "supergroup";
}

// ==================== LIMIT CHECKS ====================

async function checkAndNotifyLimits(): Promise<void> {
  if (!ADMIN_USER_ID) return;

  const usage = await checkUpstashUsage();
  if (!usage || usage.warnings.length === 0) return;

  for (const warning of usage.warnings) {
    console.log(`[LIMIT WARNING] ${warning}`);
    await sendTelegramMessage(
      parseInt(ADMIN_USER_ID),
      `*Upstash Limit Warning*\n\n${warning}\n\nConsider upgrading or cleaning up old data.`,
      "Markdown"
    );
  }
}

// ==================== GROUP MESSAGE HANDLER ====================

async function handleGroupMessage(
  chatId: number,
  messageId: number,
  userId: number,
  userName: string,
  text: string,
  chatTitle: string
): Promise<void> {
  const groupId = chatId.toString();

  // Get or create group config
  const config = await getOrCreateGroupConfig(groupId, chatTitle, ADMIN_USER_ID);

  if (!config.enabled) return;

  // Log message for summaries
  if (config.summariesEnabled) {
    await logGroupMessage(groupId, {
      messageId,
      userId: userId.toString(),
      userName,
      text,
      timestamp: Date.now(),
    });
  }

  // Store recent message for context
  await storeRecentMessage(groupId, userName, text);

  // Check moderation
  if (config.moderationEnabled) {
    const modResult = await checkModerationWithAI(groupId, userId.toString(), text, userName);

    if (modResult.shouldAct) {
      console.log(`[MODERATION] ${modResult.action} for ${userName}: ${modResult.reason}`);

      if (modResult.action === "warn") {
        await sendTelegramMessage(
          chatId,
          `${userName}, ${modResult.reason}`,
          undefined,
          messageId
        );
      } else if (modResult.action === "delete") {
        await deleteMessage(chatId, messageId);
        await sendTelegramMessage(chatId, `Message from ${userName} removed: ${modResult.reason}`);
      } else if (modResult.action !== "none") {
        await executeModeration(modResult.action, groupId, messageId, userId.toString(), BOT_TOKEN);
        await sendTelegramMessage(chatId, `Action taken against ${userName}: ${modResult.action} (${modResult.reason})`);
      }

      return; // Don't auto-reply to moderated messages
    }
  }

  // Check auto-reply
  if (config.autoReplyEnabled) {
    const replyResult = await checkAutoReply(groupId, text, userName, BOT_USERNAME);

    if (replyResult.shouldReply && replyResult.response) {
      console.log(`[AUTO-REPLY] ${replyResult.replyType} trigger for ${userName}`);
      await sendTelegramMessage(chatId, replyResult.response, "Markdown", messageId);
    }
  }
}

// ==================== GROUP ADMIN COMMANDS ====================

async function handleGroupCommand(
  chatId: number,
  userId: number,
  userName: string,
  command: string,
  args: string[],
  chatTitle: string
): Promise<void> {
  const groupId = chatId.toString();
  const config = await getOrCreateGroupConfig(groupId, chatTitle, ADMIN_USER_ID);

  // Check if user is group admin
  const userIsAdmin = isGroupAdmin(config, userId.toString()) || isAdmin(userId);

  switch (command) {
    case "grouphelp":
      await sendTelegramMessage(
        chatId,
        `*Group Bot Commands*

*Everyone:*
/grouphelp - Show this help
/summary - Get today's summary
/rules - Show auto-reply rules

*Admins only:*
/groupstatus - Show group config
/autoreply on|off - Toggle auto-reply
/moderation on|off - Toggle moderation
/summaries on|off - Toggle summaries
/addrule <trigger>|<response> - Add auto-reply rule
/delrule <id> - Delete auto-reply rule
/warnings @user - Check user warnings
/clearwarnings @user - Clear user warnings
/weeklysummary - Generate weekly summary`,
        "Markdown"
      );
      break;

    case "summary":
      const today = new Date().toISOString().split("T")[0];
      let summary = await getStoredSummary(groupId, today);

      if (!summary) {
        await sendTelegramMessage(chatId, "Generating today's summary...");
        summary = await generateDailySummary(groupId);
      }

      if (summary) {
        await sendTelegramMessage(chatId, formatSummaryForTelegram(summary), "Markdown");
      } else {
        await sendTelegramMessage(chatId, "No messages to summarize yet today.");
      }
      break;

    case "rules":
      if (config.autoReplyRules.length === 0) {
        await sendTelegramMessage(chatId, "No auto-reply rules configured.");
      } else {
        const rulesList = config.autoReplyRules
          .map((r, i) => `${i + 1}. [${r.enabled ? "ON" : "OFF"}] ${r.triggerType}: "${r.trigger}" -> "${r.response.substring(0, 30)}..."`)
          .join("\n");
        await sendTelegramMessage(chatId, `*Auto-Reply Rules:*\n\n${rulesList}`, "Markdown");
      }
      break;

    case "groupstatus":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      await sendTelegramMessage(
        chatId,
        `*Group Status: ${config.groupName}*

Enabled: ${config.enabled ? "Yes" : "No"}
Auto-Reply: ${config.autoReplyEnabled ? "ON" : "OFF"}
Moderation: ${config.moderationEnabled ? "ON" : "OFF"}
Summaries: ${config.summariesEnabled ? "ON" : "OFF"}

Rules: ${config.autoReplyRules.length} auto-reply, ${config.moderationRules.length} moderation
Messages processed: ${config.messagesProcessed}
Last activity: ${new Date(config.lastActivity).toLocaleString()}`,
        "Markdown"
      );
      break;

    case "autoreply":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const autoReplyState = args[0]?.toLowerCase() === "on";
      await updateGroupConfig(groupId, { autoReplyEnabled: autoReplyState });
      await sendTelegramMessage(chatId, `Auto-reply ${autoReplyState ? "enabled" : "disabled"}.`);
      break;

    case "moderation":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const modState = args[0]?.toLowerCase() === "on";
      await updateGroupConfig(groupId, { moderationEnabled: modState });
      await sendTelegramMessage(chatId, `Moderation ${modState ? "enabled" : "disabled"}.`);
      break;

    case "summaries":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const sumState = args[0]?.toLowerCase() === "on";
      await updateGroupConfig(groupId, { summariesEnabled: sumState });
      await sendTelegramMessage(chatId, `Summaries ${sumState ? "enabled" : "disabled"}.`);
      break;

    case "addrule":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const ruleText = args.join(" ");
      const [trigger, response] = ruleText.split("|").map(s => s.trim());
      if (!trigger || !response) {
        await sendTelegramMessage(chatId, "Usage: /addrule trigger text | response text");
        return;
      }
      const ruleId = await addAutoReplyRule(groupId, {
        trigger,
        triggerType: "keyword",
        response,
        enabled: true,
        cooldownSeconds: 30,
      });
      await sendTelegramMessage(chatId, `Rule added with ID: ${ruleId}`);
      break;

    case "delrule":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const delId = args[0];
      if (!delId) {
        await sendTelegramMessage(chatId, "Usage: /delrule <rule-id>");
        return;
      }
      const deleted = await removeAutoReplyRule(groupId, delId);
      await sendTelegramMessage(chatId, deleted ? "Rule deleted." : "Rule not found.");
      break;

    case "warnings":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      // Extract user ID from mention or argument
      const targetUser = args[0]?.replace("@", "");
      if (!targetUser) {
        await sendTelegramMessage(chatId, "Usage: /warnings @user or /warnings user_id");
        return;
      }
      const warnings = await getUserWarnings(groupId, targetUser);
      await sendTelegramMessage(
        chatId,
        `*Warnings for ${targetUser}:*\n\nCount: ${warnings.count}\nReasons: ${warnings.reasons.join(", ") || "None"}`,
        "Markdown"
      );
      break;

    case "clearwarnings":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const clearUser = args[0]?.replace("@", "");
      if (!clearUser) {
        await sendTelegramMessage(chatId, "Usage: /clearwarnings @user or /clearwarnings user_id");
        return;
      }
      await clearUserWarnings(groupId, clearUser);
      await sendTelegramMessage(chatId, `Warnings cleared for ${clearUser}.`);
      break;

    case "weeklysummary":
      if (!userIsAdmin) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      await sendTelegramMessage(chatId, "Generating weekly summary...");
      const weekly = await generateWeeklySummary(groupId);
      if (weekly) {
        await sendTelegramMessage(chatId, formatSummaryForTelegram(weekly), "Markdown");
      } else {
        await sendTelegramMessage(chatId, "Not enough messages for a weekly summary.");
      }
      break;

    default:
      // Unknown group command, ignore
      break;
  }
}

// ==================== PRIVATE CHAT HANDLERS ====================

async function handleCommand(
  chatId: number,
  userId: number,
  command: string,
  userName: string
): Promise<void> {
  console.log(`[CMD] /${command} from ${userName} (${userId})`);

  switch (command) {
    case "start":
      await sendTelegramMessage(
        chatId,
        `Hello ${userName}! I'm Claude AI bot.

Send me any message and I'll respond using Claude.

*Commands:*
/imagine <prompt> - Generate AI images
/clear - Clear conversation history
/stats - View memory stats
/help - Show this message

*Group Features:*
Add me to a group for auto-reply, moderation, and daily summaries!`,
        "Markdown"
      );
      break;

    case "help":
      await sendTelegramMessage(
        chatId,
        `*Claude AI Bot*

Just send me a message and I'll respond!

*Commands:*
/imagine <prompt> - Generate AI images
/clear - Clear your conversation history
/stats - View memory statistics
/help - Show this help

*Admin Commands:*
/cleanup - Remove old chat histories
/groups - List all managed groups
/users - List all tracked users
/user <id> - Get specific user info`,
        "Markdown"
      );
      break;

    case "clear":
      await clearChatHistory(chatId.toString());
      await sendTelegramMessage(chatId, "Conversation cleared!");
      break;

    case "imagine":
      // This is handled separately with the full message text
      break;

    case "stats":
      const stats = await getMemoryStats();
      const memoryCheck = checkMemoryLimit();
      const upstashUsage = await checkUpstashUsage();

      let statsMessage = `*Memory Stats*

Storage: ${stats.storage}
Total chats: ${stats.totalChats}
Total messages: ${stats.totalMessages}
${stats.sizeMB > 0 ? `Local size: ${stats.sizeMB.toFixed(2)} MB` : ""}`;

      if (upstashUsage) {
        statsMessage += `

*Upstash Usage (Free Tier)*
Data: ${upstashUsage.dataUsedMB.toFixed(1)} / ${upstashUsage.dataLimitMB} MB (${upstashUsage.dataPercentage.toFixed(1)}%)
Bandwidth: ${upstashUsage.bandwidthUsedGB.toFixed(2)} / ${upstashUsage.bandwidthLimitGB} GB (${upstashUsage.bandwidthPercentage.toFixed(1)}%)`;

        if (upstashUsage.warnings.length > 0) {
          statsMessage += `\n\n*Warnings:*\n${upstashUsage.warnings.join("\n")}`;
        }
      }

      statsMessage += `\n\n${memoryCheck.isWarning ? "WARNING: Local memory approaching limit!" : "Status: OK"}`;

      await sendTelegramMessage(chatId, statsMessage, "Markdown");

      if (memoryCheck.isWarning && ADMIN_USER_ID) {
        await sendTelegramMessage(
          parseInt(ADMIN_USER_ID),
          `MEMORY WARNING: ${memoryCheck.message}`
        );
      }
      break;

    case "cleanup":
      if (!isAdmin(userId)) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const deletedCount = await cleanupOldChats(30);
      await sendTelegramMessage(chatId, `Cleaned up ${deletedCount} old chats.`);
      break;

    case "groups":
      if (!isAdmin(userId)) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const groups = await listAllGroups();
      if (groups.length === 0) {
        await sendTelegramMessage(chatId, "No groups configured yet.");
      } else {
        const groupList = groups
          .map(g => `*${g.groupName}*\n  Auto-reply: ${g.autoReplyEnabled ? "ON" : "OFF"} | Mod: ${g.moderationEnabled ? "ON" : "OFF"} | Sum: ${g.summariesEnabled ? "ON" : "OFF"}`)
          .join("\n\n");
        await sendTelegramMessage(chatId, `*Managed Groups (${groups.length}):*\n\n${groupList}`, "Markdown");
      }
      break;

    case "users":
      if (!isAdmin(userId)) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      const usersStats = await getUsersStats();
      if (usersStats.totalUsers === 0) {
        await sendTelegramMessage(chatId, "No users tracked yet. Users will be tracked when they interact with the bot.");
      } else {
        await sendTelegramMessage(chatId, formatUsersForTelegram(usersStats), "Markdown");
      }
      break;

    case "user":
      if (!isAdmin(userId)) {
        await sendTelegramMessage(chatId, "Admin only command.");
        return;
      }
      // /user <user_id> - get specific user info
      const targetUserId = parseInt(command.split(" ")[1] || "");
      if (targetUserId) {
        const userData = await getUser(targetUserId);
        if (userData) {
          await sendTelegramMessage(
            chatId,
            `*User Info:*\n\nID: ${userData.userId}\nName: ${userData.firstName} ${userData.lastName || ""}\nUsername: ${userData.username ? "@" + userData.username : "N/A"}\nMessages: ${userData.messageCount}\nFirst seen: ${new Date(userData.firstSeen).toLocaleString()}\nLast seen: ${new Date(userData.lastSeen).toLocaleString()}\nLast message: ${userData.lastMessage?.substring(0, 100) || "N/A"}`,
            "Markdown"
          );
        } else {
          await sendTelegramMessage(chatId, "User not found.");
        }
      } else {
        await sendTelegramMessage(chatId, "Usage: /user <user_id>");
      }
      break;

    default:
      await sendTelegramMessage(chatId, "Unknown command. Try /help");
  }
}

async function handleTextMessage(
  chatId: number,
  userId: number,
  text: string,
  userName: string
): Promise<void> {
  console.log(`[MSG] From ${userName} (${userId}): ${text.substring(0, 50)}...`);

  await sendTypingAction(chatId);

  const { history, memoryWarning } = await addMessage(
    chatId.toString(),
    "user",
    text,
    userName
  );

  if (memoryWarning && ADMIN_USER_ID) {
    console.log(`[MEMORY] ${memoryWarning}`);
    await sendTelegramMessage(
      parseInt(ADMIN_USER_ID),
      `MEMORY ALERT: ${memoryWarning}`
    );
  }

  try {
    const response = await generateResponse(history);
    await addMessage(chatId.toString(), "assistant", response, userName);
    await sendTelegramMessage(chatId, response, "Markdown");
    // Track the bot's response for this user
    await updateUserLastResponse(userId, response);
    console.log(`[SENT] Reply to ${userName}`);
  } catch (error: any) {
    console.error(`[ERROR] Claude API:`, error.message);
    await sendTelegramMessage(chatId, `Error: ${error.message}`);
  }
}

async function handlePhotoMessage(
  chatId: number,
  userId: number,
  photoFileId: string,
  caption: string,
  userName: string
): Promise<void> {
  console.log(`[PHOTO] From ${userName} (${userId}): ${caption}`);

  await sendTypingAction(chatId);

  try {
    const fileUrl = await getFileUrl(photoFileId);
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const analysis = await analyzeImage(
      base64,
      "image/jpeg",
      caption || "What's in this image?"
    );

    await addMessage(chatId.toString(), "user", `[Image] ${caption || "Sent an image"}`, userName);
    await addMessage(chatId.toString(), "assistant", analysis, userName);

    await sendTelegramMessage(chatId, analysis, "Markdown");
    console.log(`[SENT] Vision reply to ${userName}`);
  } catch (error: any) {
    console.error(`[ERROR] Vision:`, error.message);
    await sendTelegramMessage(chatId, `Error analyzing image: ${error.message}`);
  }
}

// ==================== SMART ROUTE RESULT HANDLER ====================

async function handleRouteResult(
  result: RouteResult,
  chatId: number,
  userName: string
): Promise<void> {
  if (!result.success) {
    await sendTelegramMessage(chatId, `Error: ${result.error || "Something went wrong"}`);
    console.log(`[ROUTE] Failed action ${result.action}: ${result.error}`);
    return;
  }

  // Handle image generation result
  if (result.action === "generate_image" && result.imageUrl) {
    await sendUploadPhotoAction(chatId);
    const sent = await sendTelegramPhoto(chatId, result.imageUrl, result.response);
    if (!sent) {
      await sendTelegramMessage(chatId, `Generated image: ${result.imageUrl}`);
    }
    console.log(`[ROUTE] Generated image for ${userName}`);
    return;
  }

  // Handle text responses
  if (result.response) {
    await sendTelegramMessage(chatId, result.response, result.parseMode);
    console.log(`[ROUTE] Sent ${result.action} response to ${userName}`);
  }
}

// ==================== MAIN WEBHOOK HANDLER ====================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Health check
  if (req.method === "GET") {
    res.status(200).json({ ok: true, message: "Claude Telegram Bot Webhook with Group Automation" });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const update = req.body;

    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const chatType = message.chat.type;
      const chatTitle = message.chat.title || "Private Chat";
      const userId = message.from?.id;
      const userName = message.from?.first_name || "Unknown";
      const messageId = message.message_id;

      // ===== TRACK USER =====
      if (message.from) {
        const telegramUser: TelegramUser = {
          id: message.from.id,
          username: message.from.username,
          firstName: message.from.first_name || "Unknown",
          lastName: message.from.last_name,
          languageCode: message.from.language_code,
          isPremium: message.from.is_premium,
          isBot: message.from.is_bot,
        };
        const { userData, isNewUser } = await trackUser(telegramUser, chatId, chatType, chatTitle, message.text);

        // Notify admin about new user
        if (isNewUser && ADMIN_USER_ID) {
          const userInfo = userData.username ? `@${userData.username}` : userData.firstName;
          const newUserMsg = `🆕 *New User Joined!*\n\n` +
            `👤 Name: ${userData.firstName}${userData.lastName ? ' ' + userData.lastName : ''}\n` +
            `🔗 Username: ${userData.username ? '@' + userData.username : 'N/A'}\n` +
            `🆔 ID: \`${userData.userId}\`\n` +
            `🌍 Language: ${userData.languageCode || 'N/A'}\n` +
            `💬 First message: "${message.text?.substring(0, 100) || 'N/A'}"`;

          await sendTelegramMessage(parseInt(ADMIN_USER_ID), newUserMsg, "Markdown");
          console.log(`[NEW USER] Notified admin about new user: ${userInfo}`);
        }
      }

      // ===== GROUP MESSAGE HANDLING =====
      if (isGroupChat(chatType)) {
        // Handle group commands
        if (message.text?.startsWith("/")) {
          const parts = message.text.split(" ");
          const command = parts[0].substring(1).split("@")[0];
          const args = parts.slice(1);
          await handleGroupCommand(chatId, userId, userName, command, args, chatTitle);
          res.status(200).json({ ok: true });
          return;
        }

        // Handle regular group messages
        if (message.text) {
          await handleGroupMessage(chatId, messageId, userId, userName, message.text, chatTitle);
        }

        res.status(200).json({ ok: true });
        return;
      }

      // ===== PRIVATE MESSAGE HANDLING =====

      // Check if user is allowed (private chats only)
      if (!isUserAllowed(userId)) {
        console.log(`[BLOCKED] User ${userId} not allowed`);
        await sendTelegramMessage(chatId, "Sorry, this bot is private.");
        res.status(200).json({ ok: true });
        return;
      }

      // Create message context for router
      const ctx: MessageContext = {
        chatId,
        userId,
        userName,
        messageId,
        isAdmin: isAdmin(userId),
      };

      // Handle legacy commands (starts with /) - maintain backwards compatibility
      if (message.text && isLegacyCommand(message.text)) {
        const { command, args } = parseLegacyCommand(message.text);

        // Special handling for /imagine with prompt (legacy support)
        if (command === "imagine") {
          const prompt = args.join(" ");
          if (!prompt) {
            await sendTelegramMessage(chatId, "Please provide a prompt. Usage: /imagine <your prompt>");
            res.status(200).json({ ok: true });
            return;
          }

          await sendTelegramMessage(chatId, `Generating image for: "${prompt}"...`);
          await sendUploadPhotoAction(chatId);

          const result = await generateImage(prompt);

          if (result.success && result.imageUrl) {
            const sent = await sendTelegramPhoto(chatId, result.imageUrl, prompt);
            if (!sent) {
              await sendTelegramMessage(chatId, `Generated image: ${result.imageUrl}`);
            }
            console.log(`[IMAGINE] Generated image for ${userName}: ${prompt}`);
          } else {
            await sendTelegramMessage(chatId, `Failed to generate image: ${result.error || "Unknown error"}`);
          }
          res.status(200).json({ ok: true });
          return;
        }

        // Handle other legacy commands
        await handleCommand(chatId, userId, command, userName);
        res.status(200).json({ ok: true });
        return;
      }

      // ===== SMART ROUTING FOR NATURAL LANGUAGE =====

      // Handle voice messages
      if (message.voice) {
        console.log(`[VOICE] Received voice message from ${userName}`);
        await sendTypingAction(chatId);

        const result = await routeVoiceMessage(message.voice.file_id, ctx);

        if (!result.success) {
          await sendTelegramMessage(chatId, `Could not process voice: ${result.error}`);
          res.status(200).json({ ok: true });
          return;
        }

        // Send transcription feedback
        if (result.transcription) {
          await sendTelegramMessage(chatId, formatTranscriptionFeedback(result.transcription));
        }

        // Handle the routed action result
        await handleRouteResult(result, chatId, userName);
        res.status(200).json({ ok: true });
        return;
      }

      // Handle text messages with smart routing
      if (message.text) {
        console.log(`[SMART] Routing message from ${userName}: "${message.text.substring(0, 50)}..."`);
        await sendTypingAction(chatId);

        const result = await routeTextMessage(message.text, ctx);
        await handleRouteResult(result, chatId, userName);
        res.status(200).json({ ok: true });
        return;
      }

      // Handle photo messages
      if (message.photo) {
        const photo = message.photo[message.photo.length - 1];
        const caption = message.caption || "";

        console.log(`[PHOTO] Received photo from ${userName}`);
        await sendTypingAction(chatId);

        // Get file and convert to base64
        const fileUrl = await getFileUrl(photo.file_id);
        const response = await fetch(fileUrl);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        const result = await routePhotoMessage(base64, caption, ctx);
        await handleRouteResult(result, chatId, userName);
        res.status(200).json({ ok: true });
        return;
      }
    }

    // Periodically check Upstash limits
    if (Math.random() < 0.1) {
      await checkAndNotifyLimits();
    }

    // Track bandwidth
    await trackBandwidth(2048);

    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("[WEBHOOK ERROR]", error);
    res.status(200).json({ ok: false, error: error.message });
  }
}
