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

  await client.sendMessage("me", {
    message: `🤖 Test from Claude Code!

Your Claude Telegram bot is set up and running permanently via PM2.

Now go chat with your bot and say "Hello"!`
  });

  console.log("✓ Message sent to your Saved Messages!");
  await client.disconnect();
}

main().catch(console.error);
