import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const tests: Record<string, any> = {
    env: {
      hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
      hasUpstash: !!process.env.UPSTASH_REDIS_REST_URL,
      isVercel: process.env.VERCEL === "1",
      nodeEnv: process.env.NODE_ENV,
    },
    imports: {},
  };

  // Test each import separately
  try {
    await import("./helpers/memory");
    tests.imports.memory = "ok";
  } catch (e: any) {
    tests.imports.memory = e.message;
  }

  try {
    await import("./helpers/claude");
    tests.imports.claude = "ok";
  } catch (e: any) {
    tests.imports.claude = e.message;
  }

  try {
    await import("./helpers/groups");
    tests.imports.groups = "ok";
  } catch (e: any) {
    tests.imports.groups = e.message;
  }

  try {
    await import("./helpers/autoreply");
    tests.imports.autoreply = "ok";
  } catch (e: any) {
    tests.imports.autoreply = e.message;
  }

  try {
    await import("./helpers/moderation");
    tests.imports.moderation = "ok";
  } catch (e: any) {
    tests.imports.moderation = e.message;
  }

  try {
    await import("./helpers/summaries");
    tests.imports.summaries = "ok";
  } catch (e: any) {
    tests.imports.summaries = e.message;
  }

  res.status(200).json(tests);
}
