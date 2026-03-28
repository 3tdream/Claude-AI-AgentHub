import type { VercelRequest, VercelResponse } from "@vercel/node";
import { testValue, testFunction } from "./helpers/test";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.status(200).json({
    ok: true,
    testValue,
    testFunctionResult: testFunction(),
  });
}
