import { promises as fs } from "fs";
import path from "path";
import type { PipelineExecution, QualityScore } from "@/types";
import { AGENT_IDS } from "@/lib/config";

const KB_DIR = path.join(process.cwd(), "agents", "agents team", "knowledge-base");

// --- Types for knowledge base entries ---

interface FailurePattern {
  id: string;
  category: string;
  title: string;
  symptoms: string;
  root_cause: string;
  solution: string;
  date_discovered: string;
  recurrence: string;
  source_pipeline?: string;
  source_step?: string;
}

interface TechDecision {
  id: string;
  title: string;
  date: string;
  status: string;
  context: string;
  decision: string;
  tradeoffs: string;
  alternatives_rejected: string[];
  source_pipeline?: string;
}

interface ArchPattern {
  id: string;
  name: string;
  context: string;
  pattern: string;
  code_reference: string;
  when_to_use: string;
  source_pipeline?: string;
}

interface AntiPattern {
  id: string;
  name: string;
  problem: string;
  solution: string;
  source_pipeline?: string;
}

interface SecurityVuln {
  id: string;
  category: string;
  title: string;
  severity: string;
  description: string;
  mitigation: string;
  date_found: string;
  source_pipeline?: string;
}

// --- File I/O helpers ---

async function readJsonFile<T>(filename: string): Promise<T> {
  const filepath = path.join(KB_DIR, filename);
  const raw = await fs.readFile(filepath, "utf-8");
  return JSON.parse(raw);
}

async function writeJsonFile(filename: string, data: unknown): Promise<void> {
  const filepath = path.join(KB_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
}

// --- Orchestrator prompt for lesson extraction ---

const LESSON_EXTRACTION_PROMPT = `You are the Orchestrator analyzing a completed pipeline execution to extract lessons learned.

PIPELINE: {{pipelineName}}
TASK: {{taskInput}}
EXECUTION STATUS: {{status}}
TOTAL DURATION: {{duration}}s

STEP RESULTS:
{{stepSummaries}}

QUALITY SCORES:
{{qualityScores}}

Analyze this execution and extract structured lessons. For each lesson, output in EXACTLY this format (one lesson per block, separate blocks with ---):

[TYPE] failure-pattern | tech-decision | architecture-pattern | anti-pattern | security-vuln
[TITLE] Short descriptive title
[CATEGORY] build | api | hydration | architecture | security | performance | devops | design
[DESCRIPTION] What happened
[ROOT_CAUSE] Why it happened (for failures/anti-patterns)
[SOLUTION] How it was resolved or should be resolved
[SEVERITY] critical | high | medium | low

Rules:
- Focus on steps that had retries (retryCount > 0) — these reveal quality issues
- Focus on steps that were escalated — these are critical learnings
- If pipeline completed successfully without retries, note any architectural patterns used
- Extract security findings from Cyber-Agent outputs
- Be specific — reference actual step names and scores
- Only output lessons that would be NEW and useful. Don't state obvious things.
- Output 0 lessons if nothing noteworthy happened.`;

// --- Core enrichment function ---

export interface EnrichmentResult {
  lessonsExtracted: number;
  failurePatternsAdded: number;
  techDecisionsAdded: number;
  architecturePatternsAdded: number;
  securityVulnsAdded: number;
}

export async function enrichKnowledgeBase(execution: PipelineExecution): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    lessonsExtracted: 0,
    failurePatternsAdded: 0,
    techDecisionsAdded: 0,
    architecturePatternsAdded: 0,
    securityVulnsAdded: 0,
  };

  // Build step summaries for the prompt
  const stepSummaries = Object.values(execution.stepResults)
    .map((r) => {
      let line = `- ${r.stepId}: ${r.status}`;
      if (r.retryCount) line += ` (${r.retryCount} retries)`;
      if (r.escalated) line += ` [ESCALATED]`;
      if (r.duration) line += ` (${(r.duration / 1000).toFixed(1)}s)`;
      if (r.evaluationFeedback) line += `\n  Feedback: ${r.evaluationFeedback.slice(0, 200)}`;
      if (r.output) line += `\n  Output: ${r.output.slice(0, 150)}`;
      if (r.error) line += `\n  Error: ${r.error.slice(0, 150)}`;
      return line;
    })
    .join("\n");

  const qualityScoresSummary = execution.qualityScores
    ? Object.entries(execution.qualityScores)
        .map(([stepId, score]) => `- ${stepId}: ${score.overall}/10 (C:${score.completeness} S:${score.specificity} A:${score.actionability})`)
        .join("\n")
    : "No scores recorded";

  const prompt = LESSON_EXTRACTION_PROMPT
    .replace("{{pipelineName}}", execution.workflowName)
    .replace("{{taskInput}}", execution.input.slice(0, 500))
    .replace("{{status}}", execution.status)
    .replace("{{duration}}", execution.totalDuration ? (execution.totalDuration / 1000).toFixed(1) : "?")
    .replace("{{stepSummaries}}", stepSummaries)
    .replace("{{qualityScores}}", qualityScoresSummary);

  // Call Orchestrator to extract lessons
  let lessonsRaw = "";
  try {
    const res = await fetch(`${getBaseUrl()}/api/ai/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: AGENT_IDS.ORCHESTRATOR,
        model: "sonnet-4-6",
        userInput: prompt,
      }),
    });
    const data = await res.json();
    if (data.success && data.content) {
      lessonsRaw = data.content;
    }
  } catch {
    // If Orchestrator fails, extract lessons mechanically from retries/escalations
    lessonsRaw = extractMechanicalLessons(execution);
  }

  if (!lessonsRaw.trim()) return result;

  // Parse structured lessons
  const lessons = parseLessons(lessonsRaw);
  result.lessonsExtracted = lessons.length;

  if (lessons.length === 0) return result;

  // Write to appropriate knowledge base files
  for (const lesson of lessons) {
    try {
      switch (lesson.type) {
        case "failure-pattern":
        case "anti-pattern": {
          const added = await addFailurePattern(lesson, execution);
          if (added) result.failurePatternsAdded++;
          break;
        }
        case "tech-decision": {
          const added = await addTechDecision(lesson, execution);
          if (added) result.techDecisionsAdded++;
          break;
        }
        case "architecture-pattern": {
          const added = await addArchitecturePattern(lesson, execution);
          if (added) result.architecturePatternsAdded++;
          break;
        }
        case "security-vuln": {
          const added = await addSecurityVuln(lesson, execution);
          if (added) result.securityVulnsAdded++;
          break;
        }
      }
    } catch {
      // Skip individual lesson write failures
    }
  }

  return result;
}

// --- Mechanical fallback when Orchestrator is unavailable ---

function extractMechanicalLessons(execution: PipelineExecution): string {
  const blocks: string[] = [];

  for (const r of Object.values(execution.stepResults)) {
    if (r.retryCount && r.retryCount > 0 && r.evaluationFeedback) {
      blocks.push(
        `[TYPE] failure-pattern\n[TITLE] Quality issue in ${r.stepId}\n[CATEGORY] build\n[DESCRIPTION] Step ${r.stepId} required ${r.retryCount} retries to pass quality evaluation\n[ROOT_CAUSE] ${r.evaluationFeedback.slice(0, 200)}\n[SOLUTION] Improve prompt specificity for this agent\n[SEVERITY] medium`,
      );
    }
    if (r.escalated) {
      blocks.push(
        `[TYPE] failure-pattern\n[TITLE] Escalation in ${r.stepId}\n[CATEGORY] build\n[DESCRIPTION] Step ${r.stepId} was escalated after failing quality checks\n[ROOT_CAUSE] ${r.error?.slice(0, 200) || "Unknown"}\n[SOLUTION] Review agent capabilities and prompt engineering\n[SEVERITY] high`,
      );
    }
  }

  return blocks.join("\n---\n");
}

// --- Lesson parsing ---

interface ParsedLesson {
  type: "failure-pattern" | "tech-decision" | "architecture-pattern" | "anti-pattern" | "security-vuln";
  title: string;
  category: string;
  description: string;
  rootCause: string;
  solution: string;
  severity: string;
}

function parseLessons(raw: string): ParsedLesson[] {
  const blocks = raw.split("---").map((b) => b.trim()).filter(Boolean);
  const lessons: ParsedLesson[] = [];

  for (const block of blocks) {
    const type = extractField(block, "TYPE");
    const title = extractField(block, "TITLE");
    const description = extractField(block, "DESCRIPTION");

    if (!type || !title) continue;

    const validTypes = ["failure-pattern", "tech-decision", "architecture-pattern", "anti-pattern", "security-vuln"];
    if (!validTypes.includes(type)) continue;

    lessons.push({
      type: type as ParsedLesson["type"],
      title,
      category: extractField(block, "CATEGORY") || "general",
      description: description || "",
      rootCause: extractField(block, "ROOT_CAUSE") || "",
      solution: extractField(block, "SOLUTION") || "",
      severity: extractField(block, "SEVERITY") || "medium",
    });
  }

  return lessons;
}

function extractField(block: string, field: string): string {
  const match = block.match(new RegExp(`\\[${field}\\]\\s*(.+?)(?=\\n\\[|$)`, "si"));
  return match ? match[1].trim() : "";
}

// --- Deduplication helpers ---

function isSimilar(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  // Simple overlap check — if 70%+ of words match
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const overlap = [...wordsA].filter((w) => wordsB.has(w)).length;
  const minSize = Math.min(wordsA.size, wordsB.size);
  return minSize > 0 && overlap / minSize > 0.7;
}

// --- Writers for each knowledge base file ---

async function addFailurePattern(lesson: ParsedLesson, execution: PipelineExecution): Promise<boolean> {
  const file = await readJsonFile<{ patterns: FailurePattern[] }>("failure-patterns.json");

  // Deduplicate
  if (file.patterns.some((p) => isSimilar(p.title, lesson.title))) return false;

  const nextId = `FAIL-${String(file.patterns.length + 1).padStart(3, "0")}`;

  const entry: FailurePattern = {
    id: nextId,
    category: lesson.category,
    title: lesson.title,
    symptoms: lesson.description,
    root_cause: lesson.rootCause,
    solution: lesson.solution,
    date_discovered: new Date().toISOString().slice(0, 10),
    recurrence: "Discovered during pipeline execution",
    source_pipeline: execution.id,
    source_step: lesson.title.match(/in (s[\d.]+\S*)/)?.[1],
  };

  file.patterns.push(entry);
  (file as Record<string, unknown>)["_updated"] = new Date().toISOString().slice(0, 10);
  await writeJsonFile("failure-patterns.json", file);
  return true;
}

async function addTechDecision(lesson: ParsedLesson, execution: PipelineExecution): Promise<boolean> {
  const file = await readJsonFile<{ decisions: TechDecision[] }>("tech-decisions.json");

  if (file.decisions.some((d) => isSimilar(d.title, lesson.title))) return false;

  const nextId = `ADR-${String(file.decisions.length + 1).padStart(3, "0")}`;

  const entry: TechDecision = {
    id: nextId,
    title: lesson.title,
    date: new Date().toISOString().slice(0, 7),
    status: "accepted",
    context: lesson.description,
    decision: lesson.solution,
    tradeoffs: lesson.rootCause || "N/A",
    alternatives_rejected: [],
    source_pipeline: execution.id,
  };

  file.decisions.push(entry);
  (file as Record<string, unknown>)["_updated"] = new Date().toISOString().slice(0, 10);
  await writeJsonFile("tech-decisions.json", file);
  return true;
}

async function addArchitecturePattern(lesson: ParsedLesson, execution: PipelineExecution): Promise<boolean> {
  const file = await readJsonFile<{ patterns: ArchPattern[]; anti_patterns: AntiPattern[] }>("architecture-patterns.json");

  if (lesson.type === "anti-pattern") {
    if (file.anti_patterns.some((p) => isSimilar(p.name, lesson.title))) return false;

    const nextId = `ANTI-${String(file.anti_patterns.length + 1).padStart(3, "0")}`;
    file.anti_patterns.push({
      id: nextId,
      name: lesson.title,
      problem: lesson.description,
      solution: lesson.solution,
      source_pipeline: execution.id,
    });
  } else {
    if (file.patterns.some((p) => isSimilar(p.name, lesson.title))) return false;

    const nextId = `PAT-${String(file.patterns.length + 1).padStart(3, "0")}`;
    file.patterns.push({
      id: nextId,
      name: lesson.title,
      context: lesson.description,
      pattern: lesson.solution,
      code_reference: "",
      when_to_use: lesson.rootCause || "When applicable",
      source_pipeline: execution.id,
    });
  }

  (file as Record<string, unknown>)["_updated"] = new Date().toISOString().slice(0, 10);
  await writeJsonFile("architecture-patterns.json", file);
  return true;
}

async function addSecurityVuln(lesson: ParsedLesson, execution: PipelineExecution): Promise<boolean> {
  const file = await readJsonFile<{ recurring_vulnerabilities: SecurityVuln[] }>("security-playbook.json");

  if (file.recurring_vulnerabilities.some((v) => isSimilar(v.title, lesson.title))) return false;

  const nextId = `VULN-${String(file.recurring_vulnerabilities.length + 1).padStart(3, "0")}`;

  file.recurring_vulnerabilities.push({
    id: nextId,
    category: lesson.category,
    title: lesson.title,
    severity: lesson.severity,
    description: lesson.description,
    mitigation: lesson.solution,
    date_found: new Date().toISOString().slice(0, 10),
    source_pipeline: execution.id,
  });

  (file as Record<string, unknown>)["_updated"] = new Date().toISOString().slice(0, 10);
  await writeJsonFile("security-playbook.json", file);
  return true;
}

// --- Utility ---

function getBaseUrl(): string {
  // Server-side only — always use absolute URL
  const port = process.env.PORT || "3070";
  return process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${port}`;
}
