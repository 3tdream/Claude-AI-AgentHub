#!/usr/bin/env node

/**
 * Script to set the Telegram webhook URL
 *
 * Usage:
 *   node scripts/set-webhook.js <VERCEL_URL>
 *
 * Example:
 *   node scripts/set-webhook.js https://my-bot.vercel.app
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VERCEL_URL = process.argv[2];

if (!BOT_TOKEN) {
  console.error("Error: TELEGRAM_BOT_TOKEN environment variable is required");
  console.error("Set it with: export TELEGRAM_BOT_TOKEN=your_token");
  process.exit(1);
}

if (!VERCEL_URL) {
  console.error("Error: Vercel URL is required as argument");
  console.error("Usage: node scripts/set-webhook.js <VERCEL_URL>");
  console.error("Example: node scripts/set-webhook.js https://my-bot.vercel.app");
  process.exit(1);
}

const webhookUrl = `${VERCEL_URL}/api/webhook`;

async function setWebhook() {
  console.log(`Setting webhook to: ${webhookUrl}`);

  try {
    // First, delete any existing webhook
    const deleteResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    );
    const deleteResult = await deleteResponse.json();
    console.log("Delete existing webhook:", deleteResult.ok ? "OK" : deleteResult.description);

    // Set new webhook
    const setResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: true,
        }),
      }
    );
    const setResult = await setResponse.json();

    if (setResult.ok) {
      console.log("Webhook set successfully!");
      console.log(`URL: ${webhookUrl}`);
    } else {
      console.error("Failed to set webhook:", setResult.description);
      process.exit(1);
    }

    // Get webhook info
    const infoResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const infoResult = await infoResponse.json();
    console.log("\nWebhook Info:");
    console.log(JSON.stringify(infoResult.result, null, 2));

  } catch (error) {
    console.error("Error setting webhook:", error.message);
    process.exit(1);
  }
}

setWebhook();
