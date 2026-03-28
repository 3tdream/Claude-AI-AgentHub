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
  console.log("Sending message to +972527505141...");

  const result = await client.sendMessage("+972527505141", {
    message: "ты редиска, но моя"
  });

  console.log("✓ Message sent! ID:", result.id);
  await client.disconnect();
}

main().catch(e => console.error("Error:", e.message));
