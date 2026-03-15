import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export interface ProjectContextResponse {
  projectId: string;
  architecture: string;
  rules: string;
  knowledgeBase: Array<{ name: string; content: string }>;
  fallbackUsed: boolean;
  errors: string[];
}

const PROJECTS_DIR = path.join(process.cwd(), "projects");
const DEFAULT_DIR = path.join(PROJECTS_DIR, "_default");

async function readFileSafe(filePath: string): Promise<{ content: string; error?: string }> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { content };
  } catch {
    return { content: "", error: `File not found: ${path.basename(filePath)}` };
  }
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId query parameter is required" },
      { status: 400 },
    );
  }

  const errors: string[] = [];
  let fallbackUsed = false;

  const projectDir = path.join(PROJECTS_DIR, projectId);

  // --- Architecture ---
  let architecture = "";
  const archResult = await readFileSafe(path.join(projectDir, "ARCHITECTURE.md"));
  if (archResult.content) {
    architecture = archResult.content;
  } else {
    // Fallback to _default
    const defaultArch = await readFileSafe(path.join(DEFAULT_DIR, "ARCHITECTURE.md"));
    architecture = defaultArch.content;
    fallbackUsed = true;
    errors.push(`No ARCHITECTURE.md for "${projectId}" — using default fallback`);
  }

  // Context size guard
  if (architecture.length > 25000) {
    errors.push(`WARNING: Architecture context is ${(architecture.length / 1000).toFixed(0)}K chars — may consume significant prompt budget`);
  }

  // --- Rules (CLAUDE.md) ---
  let rules = "";
  const rulesResult = await readFileSafe(path.join(projectDir, "CLAUDE.md"));
  if (rulesResult.content) {
    rules = rulesResult.content;
  } else if (rulesResult.error) {
    errors.push(rulesResult.error);
  }

  // --- Knowledge Base ---
  const knowledgeBase: Array<{ name: string; content: string }> = [];
  const kbDir = path.join(projectDir, "knowledge-base");
  try {
    const kbFiles = await fs.readdir(kbDir);
    const jsonFiles = kbFiles.filter((f) => f.endsWith(".json"));
    for (const file of jsonFiles) {
      const result = await readFileSafe(path.join(kbDir, file));
      if (result.content) {
        knowledgeBase.push({ name: file.replace(".json", ""), content: result.content });
      } else if (result.error) {
        errors.push(result.error);
      }
    }
  } catch {
    // No knowledge-base directory — not an error, just empty
  }

  const response: ProjectContextResponse = {
    projectId,
    architecture,
    rules,
    knowledgeBase,
    fallbackUsed,
    errors,
  };

  return NextResponse.json(response);
}
