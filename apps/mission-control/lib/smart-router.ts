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

    // Map agents to pipeline steps
    const { selectedStepIds, skippedStepIds } = mapAgentsToSteps(
      agents,
      mode,
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
): { selectedStepIds: string[]; skippedStepIds: string[] } {
  if (mode === "full") {
    return {
      selectedStepIds: CRM_PIPELINE_STAGES.map((s) => s.id),
      skippedStepIds: [],
    };
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
