import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION || ""),
    parseInt(process.env.TELEGRAM_API_ID || "0"),
    process.env.TELEGRAM_API_HASH || "",
    { connectionRetries: 5 }
  );

  await client.connect();

  const result = await client.sendMessage("me", {
    message: `🤖 Hello from telegram-mcp!

This is a test message sent by Claude Code using the MTProto API.

Your MCP server is working correctly!

Sent at: ${new Date().toLocaleString()}`
  });

  console.log("✓ Message sent! ID:", result.id);
  await client.disconnect();
}

main().catch(console.error);
