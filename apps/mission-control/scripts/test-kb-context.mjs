/**
 * Test: what does each agent see from KB?
 * Run: node scripts/test-kb-context.mjs
 */
import { readFileSync } from "fs";
import { join } from "path";

const KB_DIR = join(process.cwd(), "data", "knowledge-base");

// Load all KB entries
function loadAll() {
  const entries = [];
  for (const f of ["failure-patterns", "success-patterns", "security-playbook", "architecture-patterns", "tech-decisions"]) {
    try {
      const data = JSON.parse(readFileSync(join(KB_DIR, `${f}.json`), "utf-8"));
      entries.push(...data.entries);
    } catch {}
  }
  return entries;
}

const allEntries = loadAll();

// Simulate matching for key agents
const agents = [
  { id: "s5-backend", agentId: "backend-agent", dependsOn: ["s4.5-arch-gate"] },
  { id: "s7-frontend", agentId: "frontend-agent", dependsOn: ["s6-designer", "s5-backend"] },
  { id: "s3.2-api", agentId: "architect-agent", dependsOn: ["s3.1-adr"] },
  { id: "s8-technical-qa", agentId: "qa-agent", dependsOn: ["s5-backend", "s7-frontend"] },
  { id: "s6-designer", agentId: "designer-agent", dependsOn: ["s5-backend"] },
  { id: "s4-cyber", agentId: "cyber-agent", dependsOn: ["s3.4-fileplan"] },
];

for (const step of agents) {
  const agentShort = step.agentId.replace("-agent", "");
  const depSet = new Set(step.dependsOn);

  const matched = allEntries.filter(e => {
    if (e.source === step.id) return true;
    if (e.agentId === step.agentId) return true;
    if (e.tags && e.tags.some(t => t === agentShort)) return true;
    if (depSet.has(e.source)) return true;
    return false;
  });

  const failures = matched.filter(e => e.id.startsWith("kb-fp") || e.id.startsWith("kb-sp"));
  const successes = matched.filter(e => e.id.startsWith("kb-su") || e.id.startsWith("kb-ap") || e.id.startsWith("kb-td"));

  console.log(`\n${step.agentId.toUpperCase()} (${step.id}): ${matched.length} KB entries`);
  console.log(`  Failures/Security: ${failures.length}`);
  failures.forEach(e => console.log(`    - [${e.severity}] ${e.title.substring(0, 70)}`));
  console.log(`  Success/Patterns: ${successes.length}`);
  successes.forEach(e => console.log(`    + ${e.title.substring(0, 70)}`));
}
