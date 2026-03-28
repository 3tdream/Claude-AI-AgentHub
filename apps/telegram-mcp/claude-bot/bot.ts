import { Bot, Context } from "grammy";
import Anthropic from "@anthropic-ai/sdk";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const ALLOWED_USER_ID = process.env.ALLOWED_USER_ID;

const bot = new Bot(BOT_TOKEN);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Store conversation history per chat
const conversations = new Map<number, Array<{ role: "user" | "assistant"; content: string }>>();

const MAX_HISTORY = 20;

console.log("Initializing bot...");
console.log("Bot token:", BOT_TOKEN ? "SET" : "MISSING");
console.log("Anthropic key:", ANTHROPIC_API_KEY ? "SET" : "MISSING");
console.log("Allowed user:", ALLOWED_USER_ID || "ALL");

bot.command("start", async (ctx) => {
  console.log(`[CMD] /start from user ${ctx.from?.id} (${ctx.from?.first_name})`);
  await ctx.reply(
    `Hello! I'm Claude AI bot.

Send me any message and I'll respond using Claude.

Commands:
/clear - Clear conversation history
/help - Show this message`
  );
});

bot.command("help", async (ctx) => {
  console.log(`[CMD] /help from user ${ctx.from?.id}`);
  await ctx.reply(
    `Claude AI Bot - Just send me a message and I'll respond!

Commands:
/clear - Clear conversation history
/help - Show this help`
  );
});

bot.command("clear", async (ctx) => {
  const chatId = ctx.chat.id;
  conversations.delete(chatId);
  console.log(`[CMD] /clear from user ${ctx.from?.id}`);
  await ctx.reply("Conversation cleared!");
});

bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from?.id;
  const userName = ctx.from?.first_name || "Unknown";
  const text = ctx.message.text;

  // Skip commands
  if (text.startsWith("/")) return;

  console.log(`[MSG] From ${userName} (${userId}): ${text.substring(0, 50)}...`);

  // Optional: restrict to allowed user
  if (ALLOWED_USER_ID && userId?.toString() !== ALLOWED_USER_ID) {
    console.log(`[BLOCKED] User ${userId} not allowed`);
    await ctx.reply("Sorry, this bot is private.");
    return;
  }

  // Get or create conversation history
  let history = conversations.get(chatId) || [];
  history.push({ role: "user", content: text });

  if (history.length > MAX_HISTORY) {
    history = history.slice(-MAX_HISTORY);
  }

  await ctx.replyWithChatAction("typing");

  try {
    console.log(`[API] Calling Claude API...`);
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: "You are a helpful AI assistant chatting via Telegram. Keep responses concise but helpful. You can use markdown formatting.",
      messages: history,
    });

    const assistantMessage = response.content[0].type === "text"
      ? response.content[0].text
      : "I couldn't generate a response.";

    console.log(`[API] Response: ${assistantMessage.substring(0, 50)}...`);

    history.push({ role: "assistant", content: assistantMessage });
    conversations.set(chatId, history);

    if (assistantMessage.length > 4000) {
      const chunks = assistantMessage.match(/.{1,4000}/gs) || [];
      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: "Markdown" }).catch(() => ctx.reply(chunk));
      }
    } else {
      await ctx.reply(assistantMessage, { parse_mode: "Markdown" }).catch(() => ctx.reply(assistantMessage));
    }
    console.log(`[SENT] Reply sent to ${userName}`);
  } catch (error: any) {
    console.error(`[ERROR] Claude API:`, error.message);
    await ctx.reply(`Error: ${error.message}`);
  }
});

bot.on("message:photo", async (ctx) => {
  const userId = ctx.from?.id;
  const userName = ctx.from?.first_name || "Unknown";
  const caption = ctx.message.caption || "What's in this image?";

  console.log(`[PHOTO] From ${userName} (${userId}): ${caption}`);

  if (ALLOWED_USER_ID && userId?.toString() !== ALLOWED_USER_ID) {
    await ctx.reply("Sorry, this bot is private.");
    return;
  }

  await ctx.replyWithChatAction("typing");

  try {
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const file = await ctx.api.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    console.log(`[API] Calling Claude Vision...`);
    const claudeResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: caption },
          ],
        },
      ],
    });

    const assistantMessage = claudeResponse.content[0].type === "text"
      ? claudeResponse.content[0].text
      : "I couldn't analyze the image.";

    console.log(`[API] Vision response: ${assistantMessage.substring(0, 50)}...`);
    await ctx.reply(assistantMessage, { parse_mode: "Markdown" }).catch(() => ctx.reply(assistantMessage));
  } catch (error: any) {
    console.error(`[ERROR] Vision:`, error.message);
    await ctx.reply(`Error: ${error.message}`);
  }
});

bot.catch((err) => {
  console.error(`[BOT ERROR]`, err);
});

console.log("Starting Claude Telegram bot...");
bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} is running!`);
  },
});
