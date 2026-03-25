/**
 * Seed content hashes for all KB files.
 * Run: node scripts/seed-kb-hashes.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

const KB_DIR = join(process.cwd(), "data", "knowledge-base");

const files = readdirSync(KB_DIR).filter(f => f.endsWith(".json") && !f.startsWith("_"));

for (const file of files) {
  const filePath = join(KB_DIR, file);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const hash = createHash("sha256").update(JSON.stringify(data.entries)).digest("hex");
  data.contentHash = hash;
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`${file}: ${hash.slice(0, 16)}... (${data.entries.length} entries)`);
}

console.log("\nAll hashes seeded.");
