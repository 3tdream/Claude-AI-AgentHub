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
  console.log("Connected! Archiving deleted accounts...\n");

  const dialogs = await client.getDialogs({ limit: 500 });

  const deletedAccounts: any[] = [];

  for (const dialog of dialogs) {
    if (dialog.isUser) {
      const entity = dialog.entity as any;
      if (entity?.deleted) {
        deletedAccounts.push({
          id: entity.id,
          entity: entity
        });
      }
    }
  }

  console.log(`Found ${deletedAccounts.length} deleted accounts to archive\n`);

  let archived = 0;
  let errors = 0;

  for (const acc of deletedAccounts) {
    try {
      // Archive the chat (folder 1 = Archive)
      await client.invoke(
        new Api.folders.EditPeerFolders({
          folderPeers: [
            new Api.InputFolderPeer({
              peer: new Api.InputPeerUser({
                userId: acc.id,
                accessHash: acc.entity.accessHash || BigInt(0),
              }),
              folderId: 1, // 1 = Archive folder
            }),
          ],
        })
      );
      archived++;
      process.stdout.write(`\rArchived: ${archived}/${deletedAccounts.length}`);
    } catch (e: any) {
      errors++;
    }
  }

  console.log(`\n\n✓ Archived ${archived} deleted account chats`);
  if (errors > 0) {
    console.log(`  (${errors} failed)`);
  }
  console.log("\nYour chat list is now clean!");

  await client.disconnect();
}

main().catch(console.error);
