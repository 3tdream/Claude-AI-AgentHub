import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as dotenv from "dotenv";

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const sessionString = process.env.TELEGRAM_SESSION || "";

const stringSession = new StringSession(sessionString);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

async function sendTestMessage() {
  try {
    console.log("Connecting to Telegram...");
    await client.connect();
    console.log("✓ Connected!");

    const message = await client.sendMessage("@MichaelClaudebot", {
      message: "hey Michael, its a test msg",
    });

    console.log("\n✅ Message sent successfully!");
    console.log("Message ID:", message.id);
    console.log("Date:", message.date);
    console.log("Text:", (message as any).message);

    await client.disconnect();
    console.log("\n✓ Disconnected");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

sendTestMessage();
