import { TelegramClient, Api } from "telegram";
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
  console.log("Connected! Scanning deleted accounts...\n");

  const dialogs = await client.getDialogs({ limit: 500 });

  const withHistory: any[] = [];
  const noHistory: any[] = [];

  for (const dialog of dialogs) {
    if (dialog.isUser) {
      const entity = dialog.entity as any;
      if (entity?.deleted) {
        // Check message count
        const messages = await client.getMessages(entity, { limit: 1 });

        if (messages.length > 0) {
          withHistory.push({
            id: entity.id,
            name: dialog.name || "Deleted Account",
            messageCount: dialog.unreadCount || messages.length,
            entity: entity
          });
        } else {
          noHistory.push({
            id: entity.id,
            name: dialog.name || "Deleted Account",
            entity: entity
          });
        }
      }
    }
  }

  console.log(`=== RESULTS ===`);
  console.log(`With history (keeping): ${withHistory.length}`);
  console.log(`No history (deleting): ${noHistory.length}\n`);

  // Delete chats with no history
  if (noHistory.length > 0) {
    console.log("Deleting empty chats...\n");
    let deleted = 0;

    for (const acc of noHistory) {
      try {
        await client.invoke(
          new Api.messages.DeleteHistory({
            peer: acc.entity,
            maxId: 0,
            justClear: false,
            revoke: true,
          })
        );
        deleted++;
        process.stdout.write(`\rDeleted: ${deleted}/${noHistory.length}`);
      } catch (e: any) {
        // Skip errors
      }
    }
    console.log(`\n\n✓ Deleted ${deleted} empty chats`);
  }

  // Report accounts with history
  if (withHistory.length > 0) {
    console.log("\n=== KEPT (have history) ===");
    for (const acc of withHistory) {
      console.log(` - ID: ${acc.id}`);
    }
    console.log("===========================\n");
  }

  await client.disconnect();
}

main().catch(console.error);
