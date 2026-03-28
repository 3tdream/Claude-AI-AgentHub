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

  const username = process.argv[2] || "sunshineee_69";
  console.log(`Getting entity: @${username}\n`);

  try {
    const entity = await client.getEntity(username) as any;

    console.log("=== USER INFO ===");
    console.log("ID:", entity.id?.toString());
    console.log("First Name:", entity.firstName || "-");
    console.log("Last Name:", entity.lastName || "-");
    console.log("Username:", entity.username ? `@${entity.username}` : "-");
    console.log("Phone:", entity.phone || "-");
    console.log("Bot:", entity.bot ? "Yes" : "No");
    console.log("Verified:", entity.verified ? "Yes" : "No");
    console.log("Premium:", entity.premium ? "Yes" : "No");
    console.log("Status:", entity.status?.className || "-");
    if (entity.photo) {
      console.log("Has Photo:", "Yes");
    }
    console.log("=================");
  } catch (e: any) {
    console.error("Error:", e.message);
  }

  await client.disconnect();
}

main().catch(console.error);
