import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Testing Telegram connection...");

  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION || ""),
    parseInt(process.env.TELEGRAM_API_ID || "0"),
    process.env.TELEGRAM_API_HASH || "",
    { connectionRetries: 5 }
  );

  await client.connect();
  console.log("Connected!");

  const me = await client.getMe() as any;
  console.log("\n=== YOUR ACCOUNT ===");
  console.log(`Name: ${me.firstName} ${me.lastName || ""}`);
  console.log(`Username: @${me.username}`);
  console.log(`Phone: ${me.phone}`);
  console.log(`ID: ${me.id}`);
  console.log("====================\n");

  // Get recent dialogs
  const dialogs = await client.getDialogs({ limit: 5 });
  console.log("Recent chats:");
  for (const d of dialogs) {
    console.log(`  - ${d.name || d.title}`);
  }

  await client.disconnect();
  console.log("\n✓ Connection test successful!");
}

main().catch(console.error);
