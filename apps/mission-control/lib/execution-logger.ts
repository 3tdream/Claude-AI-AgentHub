/**
 * Execution Logger — records full pipeline execution for replay & debugging.
 *
 * Saves per-stage: input prompt, output, tool calls, model used, tokens, duration, confidence.
 * Replay mode: load a log file and step through each stage's request/response.
 */

import { promises as fs } from "fs";
import path from "path";
import type { PipelineExecution } from "@/types";

const LOGS_DIR = path.join(process.cwd(), "data", "execution-logs");

export interface StageLog {
  stageId: string;
  agentId: string;
  agentName: string;
  model: string;
  toolMode: string;
  inputPrompt: string;
  output: string;
  toolCalls?: Array<{ name: string; input: Record<string, string>; output: string; success: boolean; durationMs: number }>;
  tokensIn: number;
  tokensOut: number;
  duration: number;
  confidence?: number;
  score?: number;
  status: string;
  error?: string;
  investigation?: { category: string; diagnosis: string };
  retryCount: number;
  timestamp: string;
}

export interface ExecutionLog {
  executionId: string;
  workflowName: string;
  input: string;
  projectId?: string;
  stages: StageLog[];
  startedAt: string;
  completedAt?: string;
  finalStatus: string;
  totalCost?: number;
}

let currentLog: ExecutionLog | null = null;

export function startExecutionLog(executionId: string, workflowName: string, input: string, projectId?: string | null): void {
  currentLog = {
    executionId,
    workflowName,
    input,
    projectId: projectId || undefined,
    stages: [],
    startedAt: new Date().toISOString(),
    finalStatus: "running",
  };
}

export function logStage(stage: StageLog): void {
  if (currentLog) {
    currentLog.stages.push(stage);
  }
}

export async function finalizeExecutionLog(execution: PipelineExecution): Promise<string | null> {
  if (!currentLog) return null;

  currentLog.completedAt = new Date().toISOString();
  currentLog.finalStatus = execution.status;

  // Calculate total cost from token usage
  if (execution.tokenUsage) {
    let total = 0;
    for (const usage of Object.values(execution.tokenUsage)) {
      total += (usage as { cost?: number }).cost || 0;
    }
    currentLog.totalCost = total;
  }

  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    const filePath = path.join(LOGS_DIR, `${currentLog.executionId}.json`);
    await fs.writeFile(filePath, JSON.stringify(currentLog, null, 2), "utf-8");
    const saved = filePath;
    currentLog = null;
    return saved;
  } catch {
    currentLog = null;
    return null;
  }
}

export async function loadExecutionLog(executionId: string): Promise<ExecutionLog | null> {
  try {
    const filePath = path.join(LOGS_DIR, `${executionId}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as ExecutionLog;
  } catch {
    return null;
  }
}

export async function listExecutionLogs(): Promise<Array<{ id: string; workflow: string; status: string; date: string; stages: number }>> {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    const files = await fs.readdir(LOGS_DIR);
    const logs: Array<{ id: string; workflow: string; status: string; date: string; stages: number }> = [];

    for (const f of files.filter(f => f.endsWith(".json")).slice(-50)) {
      try {
        const raw = await fs.readFile(path.join(LOGS_DIR, f), "utf-8");
        const log: ExecutionLog = JSON.parse(raw);
        logs.push({
          id: log.executionId,
          workflow: log.workflowName,
          status: log.finalStatus,
          date: log.startedAt,
          stages: log.stages.length,
        });
      } catch { /* skip corrupt files */ }
    }

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}
