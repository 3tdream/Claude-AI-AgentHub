/**
 * Nightly Evolution — PM2 cron script
 * Runs at 03:00 every night via ecosystem.config.js
 *
 * 1. Triggers evolution (pattern extraction + KB update)
 * 2. Triggers cross-session sync (KB ↔ CLI memory)
 * 3. Logs results
 */

const MC_URL = process.env.MC_URL || "http://localhost:3077";

async function run() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Nightly evolution starting...`);

  // Step 1: Run evolution (7-day window)
  try {
    const res = await fetch(`${MC_URL}/api/pipeline/evolution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ windowHours: 168 }),
    });
    const data = await res.json();
    const r = data.data;
    console.log(`[evolution] ${r.summary}`);
    console.log(`[evolution] New KB entries: ${r.newEntries.length}, Duplicates skipped: ${r.duplicatesSkipped}`);
    console.log(`[evolution] Calibration error: ${r.calibration.calibrationError}%`);
    if (r.degradationAlerts.length > 0) {
      console.log(`[evolution] Degradation alerts:`);
      r.degradationAlerts.forEach((a) => console.log(`  ${a.agentId}: ${a.trend} (${a.recentValue}% → ${a.historicalValue}%)`));
    }
  } catch (e) {
    console.error(`[evolution] FAILED:`, e.message || e);
  }

  // Step 2: Cross-session sync
  try {
    const res = await fetch(`${MC_URL}/api/knowledge-base/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const r = data.data;
    console.log(`[sync] KB→Memory: ${r.kbToMemory.exported} exported | Memory→KB: ${r.memoryToKb.imported} imported`);
  } catch (e) {
    console.error(`[sync] FAILED:`, e.message || e);
  }

  // Step 3: Health check snapshot
  try {
    const res = await fetch(`${MC_URL}/api/system/health`);
    const r = await res.json();
    console.log(`[health] ${r.overall} (${r.overallScore}/100) — ${r.activeAlerts} alerts, ${r.criticalAlerts} critical`);
  } catch (e) {
    console.error(`[health] FAILED:`, e.message || e);
  }

  console.log(`[${new Date().toISOString()}] Nightly evolution complete.`);
}

run().catch((e) => {
  console.error("Nightly evolution crashed:", e);
  process.exit(1);
});
