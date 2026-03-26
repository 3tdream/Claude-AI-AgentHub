/**
 * Project Context Loader
 *
 * Loads context for any project in apps/ directory:
 * - Project path, framework, stack
 * - Key file listing (top-level structure)
 * - CLAUDE.md / ARCHITECTURE.md if present
 * - Package.json scripts
 * - Project-specific KB entries
 *
 * Used by pipeline executor to give agents full awareness of target project.
 */

import { promises as fs } from "fs";
import path from "path";

export interface ProjectContext {
  projectId: string;
  projectPath: string;
  framework: string;
  stack: string[];
  fileStructure: string;
  scripts: Record<string, string>;
  architecture: string;
  rules: string;
  promptBlock: string;
}

const APPS_DIR = path.resolve(process.cwd(), "..");

export async function loadProjectContext(projectId: string): Promise<ProjectContext | null> {
  if (!projectId || projectId === "mission-control") return null;

  const projectPath = path.join(APPS_DIR, projectId);

  // Verify project exists
  try {
    await fs.access(projectPath);
  } catch {
    return null;
  }

  // Read package.json
  let framework = "unknown";
  let stack: string[] = [];
  let scripts: Record<string, string> = {};
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(projectPath, "package.json"), "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.next) { framework = "nextjs"; stack.push("nextjs"); }
    else if (deps.vite) { framework = "vite"; stack.push("vite"); }
    else if (deps.express) { framework = "express"; stack.push("express"); }
    if (deps.react) stack.push("react");
    if (deps.tailwindcss || deps["@tailwindcss/vite"]) stack.push("tailwind");
    if (deps.prisma) stack.push("prisma");
    if (deps.openai) stack.push("openai");
    if (deps["@anthropic-ai/sdk"]) stack.push("anthropic");
    scripts = pkg.scripts || {};
  } catch { /* no package.json */ }

  // File structure (top 2 levels, skip node_modules/.next)
  let fileStructure = "";
  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    const dirs: string[] = [];
    const files: string[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") continue;
      if (entry.isDirectory()) {
        dirs.push(entry.name);
        // List first-level contents of key directories
        if (["app", "src", "components", "lib", "pages", "api"].includes(entry.name)) {
          try {
            const subEntries = await fs.readdir(path.join(projectPath, entry.name));
            const subItems = subEntries.filter(s => !s.startsWith(".")).slice(0, 15);
            dirs.push(...subItems.map(s => `  ${entry.name}/${s}`));
          } catch { /* skip */ }
        }
      } else {
        files.push(entry.name);
      }
    }

    fileStructure = [...dirs.map(d => `[dir] ${d}`), ...files.map(f => `      ${f}`)].join("\n");
  } catch { /* skip */ }

  // Architecture docs
  let architecture = "";
  for (const name of ["ARCHITECTURE.md", "CLAUDE.md", "README.md"]) {
    try {
      const content = await fs.readFile(path.join(projectPath, name), "utf-8");
      architecture += `\n### ${name}\n${content.substring(0, 3000)}\n`;
    } catch { /* not found */ }
  }

  // Build prompt block
  const promptBlock = `
═══ PROJECT CONTEXT ═══
PROJECT: ${projectId}
PATH: ${projectPath}
FRAMEWORK: ${framework}
STACK: ${stack.join(", ")}

FILE STRUCTURE:
${fileStructure}

SCRIPTS: ${Object.entries(scripts).map(([k, v]) => `${k}: ${v}`).join(" | ")}
${architecture ? `\nDOCUMENTATION:\n${architecture}` : ""}

IMPORTANT: All your file operations (read_file, edit_file, list_files, run_command) execute in THIS project directory. Paths are relative to: ${projectPath}
If your first grep finds nothing, run \`list_files .\` to verify the directory.
═══ END PROJECT CONTEXT ═══`;

  return {
    projectId,
    projectPath,
    framework,
    stack,
    fileStructure,
    scripts,
    architecture,
    rules: "",
    promptBlock,
  };
}
