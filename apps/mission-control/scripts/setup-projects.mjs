/**
 * Project Setup Script — one command to prepare all projects
 *
 * 1. Scans apps/ for projects
 * 2. Tests binary health (next/vite/tsx)
 * 3. Auto-fixes broken deps via npm install
 * 4. Generates mission-control.json manifest
 * 5. Reports results
 *
 * Run: node scripts/setup-projects.mjs
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

const APPS_DIR = resolve(process.cwd(), "..");
const MC_DIR = process.cwd();
const BASE_PORT = 3010;
const MC_PORT = 3077;

// ── Helpers ──────────────────────────────

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return null; }
}

function detectFramework(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (deps.next) return "nextjs";
  if (deps.vite) return "vite";
  if (deps.express) return "express";
  if (deps.flask) return "flask";
  return "node";
}

function detectBinary(framework) {
  switch (framework) {
    case "nextjs": return "next";
    case "vite": return "vite";
    default: return "tsx";
  }
}

function detectDevCommand(pkg, framework) {
  // Prefer dev:web for dual-mode projects
  if (pkg.scripts?.["dev:web"]) return "npm run dev:web";
  if (pkg.scripts?.dev) return "npm run dev";
  if (framework === "nextjs") return "npx next dev";
  if (framework === "vite") return "npx vite";
  return "npm run dev";
}

function extractPort(pkg) {
  const script = pkg.scripts?.dev || pkg.scripts?.["dev:web"] || "";
  const match = script.match(/-p\s+(\d+)|--port\s+(\d+)/);
  return match ? parseInt(match[1] || match[2]) : null;
}

function testBinary(projectPath, binary) {
  const binPath = join(projectPath, "node_modules", ".bin", binary);
  const cmdPath = binPath + ".cmd";
  if (!existsSync(binPath) && !existsSync(cmdPath)) return "missing";

  try {
    execSync(`"${binPath}" --version`, { cwd: projectPath, timeout: 5000, stdio: "pipe" });
    return "ok";
  } catch (e) {
    const msg = e.stderr?.toString() || e.message || "";
    if (msg.includes("Cannot find module")) return "broken_module";
    if (msg.includes("styled-jsx")) return "broken_styled_jsx";
    return "error";
  }
}

function fixBinary(projectPath, framework, pkg) {
  const binary = detectBinary(framework);
  const version = pkg.dependencies?.[binary] || pkg.devDependencies?.[binary] || "latest";
  const cleanVersion = version.replace(/^\^|~/, "");

  console.log(`    Installing ${binary}@${cleanVersion}...`);
  try {
    execSync(
      `npm install ${binary}@${cleanVersion} --install-strategy=nested --no-workspaces --ignore-scripts --legacy-peer-deps`,
      { cwd: projectPath, timeout: 60000, stdio: "pipe" }
    );
    return testBinary(projectPath, binary) === "ok";
  } catch {
    // Fallback: try without version
    try {
      execSync(
        `npm install ${binary} --install-strategy=nested --no-workspaces --ignore-scripts --legacy-peer-deps`,
        { cwd: projectPath, timeout: 60000, stdio: "pipe" }
      );
      return testBinary(projectPath, binary) === "ok";
    } catch {
      return false;
    }
  }
}

function generateManifest(projectPath, id, pkg, framework, port) {
  const manifest = {
    id,
    name: pkg.name || id,
    port,
    stack: detectStack(pkg),
    entrypoint: framework === "nextjs" ? "app/page.tsx" : framework === "vite" ? "src/App.tsx" : "src/index.ts",
    devCommand: detectDevCommand(pkg, framework),
    kb_scope: ["global", id],
  };

  const manifestPath = join(projectPath, "mission-control.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  return manifest;
}

function detectStack(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack = [];
  if (deps.next) stack.push("nextjs");
  if (deps.vite) stack.push("vite");
  if (deps.react) stack.push("react");
  if (deps.tailwindcss || deps["@tailwindcss/vite"]) stack.push("tailwind");
  if (deps.prisma) stack.push("prisma");
  if (deps.mongoose || deps.mongodb) stack.push("mongodb");
  if (deps.pg) stack.push("postgres");
  if (deps.three) stack.push("threejs");
  if (deps.openai) stack.push("openai");
  if (deps["@anthropic-ai/sdk"]) stack.push("anthropic");
  return stack;
}

// ── Main ─────────────────────────────────

console.log("=== PROJECT SETUP ===\n");

const dirs = readdirSync(APPS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== "mission-control" && !d.name.startsWith("."))
  .map(d => d.name);

const usedPorts = new Set([MC_PORT]);
let nextPort = BASE_PORT;
function allocPort() {
  while (usedPorts.has(nextPort)) nextPort++;
  usedPorts.add(nextPort);
  return nextPort;
}

const results = [];

for (const dirName of dirs) {
  const projectPath = join(APPS_DIR, dirName);
  const pkg = readJson(join(projectPath, "package.json"));
  if (!pkg) {
    console.log(`⊘ ${dirName}: no package.json, skipping`);
    continue;
  }

  const framework = detectFramework(pkg);
  const binary = detectBinary(framework);
  const scriptPort = extractPort(pkg);
  const port = scriptPort || allocPort();
  if (scriptPort) usedPorts.add(scriptPort);

  console.log(`● ${dirName} (${framework}, :${port})`);

  // Test binary
  let health = testBinary(projectPath, binary);
  console.log(`  Binary ${binary}: ${health}`);

  // Auto-fix if broken
  let fixed = false;
  if (health !== "ok") {
    fixed = fixBinary(projectPath, framework, pkg);
    health = fixed ? "ok (fixed)" : "broken";
    console.log(`  After fix: ${health}`);
  }

  // Generate manifest
  const manifest = generateManifest(projectPath, dirName, pkg, framework, port);
  console.log(`  Manifest: mission-control.json created`);

  results.push({
    id: dirName,
    framework,
    port,
    binary,
    health,
    manifest: true,
    devCommand: manifest.devCommand,
  });

  console.log("");
}

// Summary
console.log("=== SUMMARY ===\n");
const ok = results.filter(r => r.health.includes("ok"));
const broken = results.filter(r => !r.health.includes("ok"));

console.log(`Total: ${results.length} | OK: ${ok.length} | Broken: ${broken.length}\n`);

console.log("Working:");
ok.forEach(r => console.log(`  ✓ ${r.id.padEnd(20)} ${r.framework.padEnd(8)} :${r.port} ${r.devCommand}`));

if (broken.length > 0) {
  console.log("\nBroken (need manual fix):");
  broken.forEach(r => console.log(`  ✗ ${r.id.padEnd(20)} ${r.framework.padEnd(8)} :${r.port} ${r.health}`));
}

// Save report
const report = { results, summary: { total: results.length, ok: ok.length, broken: broken.length }, generatedAt: new Date().toISOString() };
writeFileSync(join(MC_DIR, "data", "project-setup-report.json"), JSON.stringify(report, null, 2), "utf-8");
console.log("\nReport saved to data/project-setup-report.json");
