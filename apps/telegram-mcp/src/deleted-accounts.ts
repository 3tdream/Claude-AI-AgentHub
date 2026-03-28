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
  console.log("Connected! Scanning for deleted accounts...\n");

  // Get all dialogs
  const dialogs = await client.getDialogs({ limit: 500 });

  const deletedAccounts: any[] = [];

  for (const dialog of dialogs) {
    if (dialog.isUser) {
      const entity = dialog.entity as any;
      // Deleted accounts have deleted=true flag
      if (entity?.deleted) {
        deletedAccounts.push({
          id: entity.id,
          name: dialog.name || "Deleted Account",
          entity: entity
        });
      }
    }
  }

  console.log(`Found ${deletedAccounts.length} deleted accounts:\n`);

  for (const acc of deletedAccounts) {
    console.log(` - ${acc.name} (ID: ${acc.id})`);
  }

  if (deletedAccounts.length === 0) {
    console.log("No deleted accounts found in your chats.");
    await client.disconnect();
    return;
  }

  // Create a group
  console.log("\nCreating group 'Deleted Accounts'...");

  try {
    // We need at least one valid user to create a group
    // Get our own ID first
    const me = await client.getMe() as any;

    // Create the group with just ourselves first
    const result = await client.invoke(
      new Api.messages.CreateChat({
        users: [me.id],
        title: "Deleted Accounts",
      })
    );

    console.log("✓ Group created!");

    // Try to add deleted accounts (most will fail since they're deleted)
    let added = 0;
    let failed = 0;

    for (const acc of deletedAccounts) {
      try {
        // Get the chat ID from result
        const updates = result as any;
        const chat = updates.chats?.[0];

        if (chat) {
          await client.invoke(
            new Api.messages.AddChatUser({
              chatId: chat.id,
              userId: acc.id,
              fwdLimit: 0,
            })
          );
          console.log(`  ✓ Added ${acc.name}`);
          added++;
        }
      } catch (e: any) {
        // Expected - deleted accounts can't be added
        failed++;
      }
    }

    console.log(`\nResults: ${added} added, ${failed} couldn't be added (deleted accounts)`);
    console.log("\nNote: Deleted accounts cannot actually join groups.");
    console.log("Consider archiving or deleting these chats instead.");

  } catch (e: any) {
    console.error("Error creating group:", e.message);
  }

  await client.disconnect();
}

main().catch(console.error);
