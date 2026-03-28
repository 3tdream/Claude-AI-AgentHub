import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAndSendScheduledSummaries } from "../helpers/summaries";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Verify cron secret or localhost
  const authHeader = req.headers.authorization;
  const isValidCron = authHeader === `Bearer ${CRON_SECRET}`;
  const isLocalhost = req.headers.host?.includes("localhost");

  if (!isValidCron && !isLocalhost && CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  console.log("[CRON] Running scheduled summaries check...");

  try {
    await checkAndSendScheduledSummaries(BOT_TOKEN, ADMIN_USER_ID);
    console.log("[CRON] Summaries check completed");
    res.status(200).json({ ok: true, message: "Summaries check completed" });
  } catch (error: any) {
    console.error("[CRON ERROR]", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
