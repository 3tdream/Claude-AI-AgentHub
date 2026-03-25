/**
 * Smart Task Router — analyzes task complexity and selects minimum agents needed.
 * Uses Claude (Orchestrator) to classify tasks into Quick/Medium/Full modes.
 */

import { callAI } from "@/lib/direct-ai-client";
import { loadAgentPrompt } from "@/lib/agent-prompt-loader";
import { CRM_PIPELINE_STAGES } from "@/lib/pipeline-templates";
import { MODE_CONFIG } from "@/lib/config";
import type { WorkflowStep } from "@/types";

// --- Types ---

export type ExecutionMode = "quick" | "medium" | "full";

export interface RoutingDecision {
  mode: ExecutionMode;
  selectedAgents: string[];
  selectedStepIds: string[];
  skippedStepIds: string[];
  reasoning: string;
  complexity: number; // 1-10
  estimatedDuration: string;
  includeCheckpoint: boolean;
  includeQualityEval: boolean;
  routedAt: string;
  routerModel: string;
}

// --- Task classification ---

type TaskType = "technical" | "product" | "research" | "mixed";

function classifyTask(input: string): TaskType {
  const t = input.toLowerCase();
  const technicalSignals = /\b(endpoint|api|route|component|page|fix|bug|refactor|migrate|update|add.*to|create.*file|implement|deploy|dockerfile|config)\b/i;
  const researchSignals = /\b(research|market|competitor|analyze|explore|discover|survey|benchmark|compare.*tools|industry)\b/i;
  const productSignals = /\b(feature|user story|prd|requirements|design|ux|workflow|flow|system.*from scratch|build.*module|new.*product)\b/i;

  const tech = technicalSignals.test(t);
  const research = researchSignals.test(t);
  const product = productSignals.test(t);

  if (research && !tech) return "research";
  if (product && !tech) return "product";
  if (tech && !product && !research) return "technical";
  return "mixed";
}

/**
 * Smart stage filtering — even in full mode, skip agents that don't match the task.
 * Maps task type + keywords to stages that should be included.
 */
function getRelevantStages(taskInput: string, taskType: TaskType): Set<string> {
  const t = taskInput.toLowerCase();
  const skip = new Set<string>();

  // Research — only for NEW products/markets, never for tasks inside existing projects
  // If task mentions existing project paths, files, or features → skip Research
  if (taskType === "technical" || taskType === "mixed") {
    skip.add("s0-research");
  }
  // Even for product tasks, skip if it references existing codebase
  if (/\b(app\/|lib\/|components\/|api\/|page\.|route\.|\.tsx|\.ts|existing|current|our|this project)\b/i.test(t)) {
    skip.add("s0-research");
  }

  // Designer — only when UI/design work is needed
  if (!/\b(ui|design|css|theme|style|component|page|dashboard|layout|mockup|token)\b/i.test(t)) {
    skip.add("s6-designer");
  }

  // DevOps — only when infra/deploy/docker is mentioned
  if (!/\b(deploy|docker|ci|cd|infra|terraform|env|devops|nginx|pm2|build)\b/i.test(t)) {
    skip.add("s12a-devops");
  }

  // ERD — only when database/schema/migration is involved
  if (!/\b(database|db|schema|migration|table|entity|model|postgres|sql|erd)\b/i.test(t)) {
    skip.add("s3.3-erd");
  }

  // Cyber — only when security-sensitive
  if (!/\b(auth|security|jwt|token|password|encrypt|permission|role|rbac|payment|pii|gdpr|compliance|secret)\b/i.test(t)) {
    skip.add("s4-cyber");
    skip.add("s10-cyber-audit");
  }

  // Business QA — skip for pure technical tasks
  if (taskType === "technical") {
    skip.add("s9-business-qa");
  }

  // Consolidation — only for large multi-file outputs
  if (taskType === "technical") {
    skip.add("s12b-consolidation");
  }

  return skip;
}

// --- Routing prompt ---

const ROUTING_PROMPT = `You are the Orchestrator's task router for a 10-agent AI team.

Your job: Given a task, determine the MINIMUM agents needed to complete it effectively.

## Available Agents
- research-agent: Market research, competitor analysis
- orchestrator: Coordination, requirements clarification
- pm-agent: PRD, Jira stories, project management
- architect-agent: System architecture, API design, ADRs
- cyber-agent: Security, threat modeling, compliance
- backend-agent: Node.js APIs, business logic, DB operations
- frontend-agent: Next.js, React, UI implementation
- designer-agent: UI/UX design, design tokens, mockups
- qa-agent: Testing, bugs, edge cases, attack plans
- devops-agent: CI/CD, infrastructure, deployment

## Modes
- **quick** (1-2 agents): Simple single-domain tasks. Examples: "write a REST endpoint", "create a React component", "research competitors"
- **medium** (3-5 agents): Multi-domain but not full lifecycle. Examples: "add PDF export with API and UI", "design auth flow with security review"
- **full** (all agents): Complete features requiring full lifecycle. Examples: "build payment system with PCI compliance", "create new booking module from scratch"

## Rules
- Prefer the SMALLEST mode that can handle the task
- Security review (cyber-agent) is REQUIRED if task involves: auth, payments, PII, public API, file uploads
- QA is recommended for medium+ tasks that produce code
- Checkpoint is only needed in full mode
- Quality evaluation: skip for quick (too costly), final-step only for medium, all steps for full
- Research is only needed if the task domain is unfamiliar or requires market context

Respond in this exact JSON format (no extra text):
{
  "mode": "quick|medium|full",
  "agents": ["agent-id-1", "agent-id-2"],
  "reasoning": "1-2 sentences explaining why this mode",
  "complexity": 5,
  "estimatedDuration": "~30s"
}`;

// --- Core routing function ---

export async function routeTask(taskInput: string): Promise<RoutingDecision> {
  const systemPrompt = await loadAgentPrompt("orchestrator");

  const response = await callAI({
    model: "sonnet-4-6",
    systemPrompt: ROUTING_PROMPT,
    userPrompt: `Task: ${taskInput}`,
    maxTokens: 500,
    temperature: 0.3,
    responseFormat: "json",
  });

  const parsed = parseRoutingResponse(response.content, taskInput);

  return {
    ...parsed,
    routedAt: new Date().toISOString(),
    routerModel: response.model,
  };
}

function parseRoutingResponse(
  content: string,
  taskInput: string,
): Omit<RoutingDecision, "routedAt" | "routerModel"> {
  try {
    // Extract JSON from response (may be wrapped in markdown code fences)
    const jsonStr = content
      .replace(/^```json\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
    const data = JSON.parse(jsonStr);

    const mode: ExecutionMode = ["quick", "medium", "full"].includes(data.mode)
      ? data.mode
      : "medium";

    const agents: string[] = Array.isArray(data.agents) ? data.agents : [];

    // Map agents to pipeline steps (with task classification for full mode)
    const { selectedStepIds, skippedStepIds } = mapAgentsToSteps(
      agents,
      mode,
      taskInput,
    );

    return {
      mode,
      selectedAgents: agents,
      selectedStepIds,
      skippedStepIds,
      reasoning: data.reasoning || "No reasoning provided",
      complexity: Math.min(10, Math.max(1, Number(data.complexity) || 5)),
      estimatedDuration: data.estimatedDuration || "~1min",
      includeCheckpoint: MODE_CONFIG[mode].includeCheckpoint,
      includeQualityEval: MODE_CONFIG[mode].evalScope !== "none",
    };
  } catch {
    // Parse failed — default to medium
    return createFallbackDecision(taskInput);
  }
}

function mapAgentsToSteps(
  agents: string[],
  mode: ExecutionMode,
  taskInput?: string,
): { selectedStepIds: string[]; skippedStepIds: string[] } {
  if (mode === "full") {
    const taskType = taskInput ? classifyTask(taskInput) : "mixed";
    const skipSet = taskInput ? getRelevantStages(taskInput, taskType) : new Set<string>();

    const selected = CRM_PIPELINE_STAGES.filter((s) => !skipSet.has(s.id)).map((s) => s.id);
    const skipped = CRM_PIPELINE_STAGES.filter((s) => skipSet.has(s.id)).map((s) => s.id);

    return { selectedStepIds: selected, skippedStepIds: skipped };
  }

  const modeConf = MODE_CONFIG[mode];
  const agentSet = new Set(agents);
  const selectedSet = new Set<string>();
  const stepsById = new Map(CRM_PIPELINE_STAGES.map((s) => [s.id, s]));

  // First pass: mark directly selected steps (skip checkpoints)
  for (const step of CRM_PIPELINE_STAGES) {
    if (!step.metadata?.isCheckpoint && agentSet.has(step.agentId)) {
      selectedSet.add(step.id);
    }
  }

  // Second pass: dependency resolution based on mode
  if (modeConf.resolveDeps === "architect-only") {
    // Medium: always include architect + PM for context
    const architectStep = CRM_PIPELINE_STAGES.find(
      (s) => s.agentId === "architect-agent",
    );
    if (architectStep) {
      selectedSet.add(architectStep.id);
      // Include architect's direct dependency (PM)
      for (const depId of architectStep.dependsOn) {
        const dep = stepsById.get(depId);
        if (dep && !dep.metadata?.isCheckpoint) {
          selectedSet.add(depId);
        }
      }
    }
    // Remove steps whose agent is in skipAgents
    const skipSet = new Set(modeConf.skipAgents);
    for (const stepId of [...selectedSet]) {
      const step = stepsById.get(stepId);
      if (step && skipSet.has(step.agentId)) {
        selectedSet.delete(stepId);
      }
    }
  }
  // resolveDeps === "none" (quick): no dependency resolution at all

  const selected: string[] = [];
  const skipped: string[] = [];
  for (const step of CRM_PIPELINE_STAGES) {
    if (selectedSet.has(step.id)) {
      selected.push(step.id);
    } else {
      skipped.push(step.id);
    }
  }

  return { selectedStepIds: selected, skippedStepIds: skipped };
}

function createFallbackDecision(
  taskInput: string,
): Omit<RoutingDecision, "routedAt" | "routerModel"> {
  return {
    mode: "medium",
    selectedAgents: ["pm-agent", "architect-agent", "backend-agent", "frontend-agent"],
    selectedStepIds: ["s2-pm", "s3-architect", "s4-backend", "s4-frontend"],
    skippedStepIds: CRM_PIPELINE_STAGES
      .filter((s) => !["s2-pm", "s3-architect", "s4-backend", "s4-frontend"].includes(s.id))
      .map((s) => s.id),
    reasoning: "Fallback: routing parse failed, using medium default",
    complexity: 5,
    estimatedDuration: "~2min",
    includeCheckpoint: false,
    includeQualityEval: true,
  };
}

// --- Recalculate routing decision for a different mode ---

export function recalculateForMode(
  currentDecision: RoutingDecision,
  mode: ExecutionMode,
): RoutingDecision {
  if (mode === "full") {
    return {
      ...currentDecision,
      mode: "full",
      selectedAgents: [...new Set(CRM_PIPELINE_STAGES.map((s) => s.agentId))],
      selectedStepIds: CRM_PIPELINE_STAGES.map((s) => s.id),
      skippedStepIds: [],
      includeCheckpoint: MODE_CONFIG.full.includeCheckpoint,
      includeQualityEval: true,
      reasoning: "Manual override: full pipeline",
    };
  }

  const { selectedStepIds, skippedStepIds } = mapAgentsToSteps(
    currentDecision.selectedAgents,
    mode,
  );

  return {
    ...currentDecision,
    mode,
    selectedStepIds,
    skippedStepIds,
    includeCheckpoint: MODE_CONFIG[mode].includeCheckpoint,
    includeQualityEval: MODE_CONFIG[mode].evalScope !== "none",
    reasoning: `Manual override: ${mode} mode`,
  };
}
