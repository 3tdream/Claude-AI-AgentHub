/**
 * Smart Message Router
 *
 * Unified entry point for all messages (text, voice, photos)
 * Uses intent detection to route to appropriate action handlers
 */

import { detectIntent, IntentResult, shouldGenerateImage } from "./intent";
import { transcribeVoiceMessage, isVoiceEnabled, formatTranscriptionFeedback } from "./voice";
import { generateImage } from "./fal";
import { generateResponse, analyzeImage } from "./claude";
import {
  addMessage,
  clearChatHistory,
  getMemoryStats,
  checkMemoryLimit,
  cleanupOldChats,
  checkUpstashUsage,
} from "./memory";
import { getUsersStats, formatUsersForTelegram, getUser, updateUserLastResponse } from "./users";
import { listAllGroups } from "./groups";

// ==================== TYPES ====================

export interface MessageContext {
  chatId: number;
  userId: number;
  userName: string;
  messageId: number;
  isAdmin: boolean;
}

export interface RouteResult {
  success: boolean;
  action: string;
  response?: string;
  imageUrl?: string;
  parseMode?: "Markdown" | "HTML";
  error?: string;
}

// ==================== ACTION HANDLERS ====================

/**
 * Handle image generation intent
 */
async function handleImageGeneration(
  prompt: string,
  ctx: MessageContext
): Promise<RouteResult> {
  console.log(`[ROUTER] Generating image for: ${prompt}`);

  const result = await generateImage(prompt);

  if (result.success && result.imageUrl) {
    return {
      success: true,
      action: "generate_image",
      response: `${prompt}`,
      imageUrl: result.imageUrl,
    };
  }

  return {
    success: false,
    action: "generate_image",
    error: result.error || "Failed to generate image",
  };
}

/**
 * Handle help intent
 */
async function handleHelp(ctx: MessageContext): Promise<RouteResult> {
  const helpText = `*Claude AI Bot*

Just send me any message and I'll respond!

*What I can do:*
- Chat with you naturally
- Generate AI images (just ask: "make me an image of...")
- Analyze photos you send me
- Transcribe voice messages

*Examples:*
- "Create an epic dragon battle image"
- "What's the capital of France?"
- "Clear our chat history"
- Send a voice message and I'll understand it!

*Commands still work too:*
/imagine <prompt> - Generate image
/clear - Clear history
/stats - View statistics
/help - Show this help`;

  return {
    success: true,
    action: "help",
    response: helpText,
    parseMode: "Markdown",
  };
}

/**
 * Handle clear history intent
 */
async function handleClearHistory(ctx: MessageContext): Promise<RouteResult> {
  await clearChatHistory(ctx.chatId.toString());

  return {
    success: true,
    action: "clear_history",
    response: "Conversation cleared! Fresh start.",
  };
}

/**
 * Handle stats intent
 */
async function handleStats(ctx: MessageContext): Promise<RouteResult> {
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

  return {
    success: true,
    action: "get_stats",
    response: statsMessage,
    parseMode: "Markdown",
  };
}

/**
 * Handle admin commands
 */
async function handleAdminCommand(
  text: string,
  ctx: MessageContext
): Promise<RouteResult> {
  if (!ctx.isAdmin) {
    return {
      success: false,
      action: "admin_command",
      error: "This command is for admins only.",
    };
  }

  const lowerText = text.toLowerCase();

  // Cleanup command
  if (lowerText.includes("cleanup")) {
    const deletedCount = await cleanupOldChats(30);
    return {
      success: true,
      action: "admin_command",
      response: `Cleaned up ${deletedCount} old chats.`,
    };
  }

  // List groups
  if (lowerText.includes("groups")) {
    const groups = await listAllGroups();
    if (groups.length === 0) {
      return {
        success: true,
        action: "admin_command",
        response: "No groups configured yet.",
      };
    }
    const groupList = groups
      .map(g => `*${g.groupName}*\n  Auto-reply: ${g.autoReplyEnabled ? "ON" : "OFF"} | Mod: ${g.moderationEnabled ? "ON" : "OFF"}`)
      .join("\n\n");
    return {
      success: true,
      action: "admin_command",
      response: `*Managed Groups (${groups.length}):*\n\n${groupList}`,
      parseMode: "Markdown",
    };
  }

  // List users
  if (lowerText.includes("users") || lowerText.includes("all users")) {
    const usersStats = await getUsersStats();
    if (usersStats.totalUsers === 0) {
      return {
        success: true,
        action: "admin_command",
        response: "No users tracked yet.",
      };
    }
    return {
      success: true,
      action: "admin_command",
      response: formatUsersForTelegram(usersStats),
      parseMode: "Markdown",
    };
  }

  // Default: not a recognized admin command
  return {
    success: false,
    action: "admin_command",
    error: "Unrecognized admin command. Try: cleanup, groups, users",
  };
}

/**
 * Handle regular chat (conversation with Claude)
 */
async function handleChat(
  text: string,
  ctx: MessageContext
): Promise<RouteResult> {
  const { history } = await addMessage(
    ctx.chatId.toString(),
    "user",
    text,
    ctx.userName
  );

  try {
    const response = await generateResponse(history);
    await addMessage(ctx.chatId.toString(), "assistant", response, ctx.userName);
    await updateUserLastResponse(ctx.userId, response);

    return {
      success: true,
      action: "chat",
      response,
      parseMode: "Markdown",
    };
  } catch (error: any) {
    return {
      success: false,
      action: "chat",
      error: error.message,
    };
  }
}

// ==================== MAIN ROUTER ====================

/**
 * Route a text message to the appropriate handler
 */
export async function routeTextMessage(
  text: string,
  ctx: MessageContext
): Promise<RouteResult> {
  // Detect intent using hybrid approach
  const intent = await detectIntent(text);

  console.log(`[ROUTER] Intent: ${intent.intent} (${intent.confidence}) via ${intent.matchMethod}`);

  // Route based on intent
  switch (intent.intent) {
    case "generate_image":
      if (shouldGenerateImage(intent)) {
        return handleImageGeneration(intent.extractedPrompt!, ctx);
      }
      // Fall through to chat if no prompt extracted
      return handleChat(text, ctx);

    case "help":
      return handleHelp(ctx);

    case "clear_history":
      return handleClearHistory(ctx);

    case "get_stats":
      return handleStats(ctx);

    case "admin_command":
      const adminResult = await handleAdminCommand(text, ctx);
      // If not a valid admin command, treat as chat
      if (!adminResult.success && !ctx.isAdmin) {
        return handleChat(text, ctx);
      }
      return adminResult;

    case "chat":
    case "unknown":
    default:
      return handleChat(text, ctx);
  }
}

/**
 * Route a voice message
 * Transcribes first, then routes the text
 */
export async function routeVoiceMessage(
  fileId: string,
  ctx: MessageContext
): Promise<RouteResult & { transcription?: string }> {
  // Check if voice is enabled
  if (!isVoiceEnabled()) {
    return {
      success: false,
      action: "voice",
      error: "Voice transcription is not configured. Please set GROQ_API_KEY.",
    };
  }

  // Transcribe the voice message
  const transcription = await transcribeVoiceMessage(fileId);

  if (!transcription.success || !transcription.text) {
    return {
      success: false,
      action: "voice",
      error: transcription.error || "Could not transcribe voice message",
    };
  }

  console.log(`[ROUTER] Voice transcribed: "${transcription.text}"`);

  // Route the transcribed text
  const result = await routeTextMessage(transcription.text, ctx);

  return {
    ...result,
    transcription: transcription.text,
  };
}

/**
 * Route a photo message
 */
export async function routePhotoMessage(
  photoBase64: string,
  caption: string,
  ctx: MessageContext
): Promise<RouteResult> {
  try {
    const analysis = await analyzeImage(
      photoBase64,
      "image/jpeg",
      caption || "What's in this image?"
    );

    await addMessage(
      ctx.chatId.toString(),
      "user",
      `[Image] ${caption || "Sent an image"}`,
      ctx.userName
    );
    await addMessage(ctx.chatId.toString(), "assistant", analysis, ctx.userName);

    return {
      success: true,
      action: "photo_analysis",
      response: analysis,
      parseMode: "Markdown",
    };
  } catch (error: any) {
    return {
      success: false,
      action: "photo_analysis",
      error: error.message,
    };
  }
}

/**
 * Check if a message is a legacy command (starts with /)
 * Used to maintain backwards compatibility
 */
export function isLegacyCommand(text: string): boolean {
  return text.trim().startsWith("/");
}

/**
 * Extract command and args from legacy command text
 */
export function parseLegacyCommand(text: string): { command: string; args: string[] } {
  const parts = text.trim().split(" ");
  const command = parts[0].substring(1).split("@")[0]; // Remove / and @botname
  const args = parts.slice(1);
  return { command, args };
}
