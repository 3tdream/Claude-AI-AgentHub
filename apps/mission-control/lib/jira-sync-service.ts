/**
 * Jira Sync Service — "The Loop"
 *
 * Non-blocking Jira lifecycle sync for pipeline execution.
 * All methods are fire-and-forget safe — errors are logged but never thrown.
 */

import {
  createIssue,
  addComment,
  getTransitions,
  transitionIssue,
} from "@/lib/jira/client";
import { getJiraConfig, hasJiraConfig } from "@/lib/jira/config";
import { addLog } from "@/lib/logs-storage";
import type { PipelineExecution, QualityScore } from "@/types";

// --- ADF helpers (Atlassian Document Format) ---

function textAdf(text: string) {
  return {
    type: "doc",
    version: 1,
    content: text
      .split("\n\n")
      .filter(Boolean)
      .map((block) => ({
        type: "paragraph",
        content: block.split("\n").map((line) => ({
          type: "text",
          text: line,
        })).reduce((acc: unknown[], item, i, arr) => {
          acc.push(item);
          if (i < arr.length - 1) acc.push({ type: "hardBreak" });
          return acc;
        }, []),
      })),
  };
}

function commentAdf(heading: string, body: string) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: heading }],
      },
      ...body
        .split("\n\n")
        .filter(Boolean)
        .map((block) => ({
          type: "paragraph",
          content: [{ type: "text", text: block.replace(/\n/g, " ") }],
        })),
    ],
  };
}

// --- Transition helper ---

async function tryTransition(issueKey: string, targetCategoryKey: string): Promise<boolean> {
  try {
    const transitions = await getTransitions(issueKey);
    // Match by status category key: "new" = To Do, "indeterminate" = In Progress, "done" = Done
    const match = transitions.find(
      (t) => t.to.statusCategory.key === targetCategoryKey,
    );
    if (match) {
      await transitionIssue(issueKey, match.id);
      return true;
    }
    // Fallback: match by common name patterns
    const nameMap: Record<string, string[]> = {
      new: ["to do", "todo", "open", "backlog"],
      indeterminate: ["in progress", "in review", "blocked"],
      done: ["done", "closed", "resolved"],
    };
    const names = nameMap[targetCategoryKey] || [];
    const fallback = transitions.find((t) =>
      names.some((n) => t.to.name.toLowerCase().includes(n)),
    );
    if (fallback) {
      await transitionIssue(issueKey, fallback.id);
      return true;
    }
  } catch {
    // Transition failed — non-blocking
  }
  return false;
}

// --- Public API ---

/**
 * Check if Jira sync is available (configured with a project key).
 */
export async function isJiraSyncEnabled(): Promise<boolean> {
  try {
    const configured = await hasJiraConfig();
    if (!configured) return false;
    const config = await getJiraConfig();
    return !!config.defaultProjectKey;
  } catch {
    return false;
  }
}

/**
 * Create a Jira Epic for a new pipeline execution.
 * Returns { jiraKey, jiraUrl } or null if Jira is unavailable.
 */
export async function createPipelineEpic(
  execution: PipelineExecution,
): Promise<{ jiraKey: string; jiraUrl: string } | null> {
  try {
    const config = await getJiraConfig();
    if (!config.defaultProjectKey) return null;

    const stageCount = Object.keys(execution.stepResults).length;
    const description = [
      `Pipeline execution for: ${execution.input.slice(0, 300)}`,
      "",
      `Stages: ${stageCount}`,
      `Started: ${execution.startedAt}`,
      `Execution ID: ${execution.id}`,
    ].join("\n");

    const issue = await createIssue({
      fields: {
        project: { key: config.defaultProjectKey },
        summary: `[Pipeline] ${execution.workflowName} — ${execution.input.slice(0, 80)}`,
        description: textAdf(description),
        issuetype: { name: "Epic" },
        labels: ["ai-pipeline", "auto-generated"],
      },
    });

    const jiraUrl = `${config.baseUrl}/browse/${issue.key}`;

    await logToSystem(
      `Jira Epic created for pipeline "${execution.workflowName}": ${issue.key}`,
      { jiraKey: issue.key, jiraUrl },
    );

    return { jiraKey: issue.key, jiraUrl };
  } catch (err) {
    // Epic creation failed — try as Story fallback (some projects don't have Epic)
    try {
      const config = await getJiraConfig();
      if (!config.defaultProjectKey) return null;

      const issue = await createIssue({
        fields: {
          project: { key: config.defaultProjectKey },
          summary: `[Pipeline] ${execution.workflowName} — ${execution.input.slice(0, 80)}`,
          description: textAdf(`Pipeline execution: ${execution.input.slice(0, 300)}`),
          issuetype: { name: "Story" },
          labels: ["ai-pipeline", "auto-generated"],
        },
      });

      const jiraUrl = `${config.baseUrl}/browse/${issue.key}`;
      await logToSystem(`Jira Story created (Epic unavailable) for pipeline: ${issue.key}`, { jiraKey: issue.key });
      return { jiraKey: issue.key, jiraUrl };
    } catch {
      await logToSystem(
        `Failed to create Jira issue for pipeline "${execution.workflowName}": ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      return null;
    }
  }
}

/**
 * Update Jira when a stage starts — transition to "In Progress" + comment.
 */
export async function onStageStart(
  jiraKey: string,
  stageId: string,
  agentName: string,
  model: string,
): Promise<void> {
  try {
    await tryTransition(jiraKey, "indeterminate");
    await addComment(
      jiraKey,
      commentAdf(
        `Stage Started: ${stageId}`,
        `Agent: ${agentName}\nModel: ${model}\nStarted: ${new Date().toISOString()}`,
      ),
    );
  } catch {
    await logToSystem(`Jira sync failed: onStageStart(${jiraKey}, ${stageId})`);
  }
}

/**
 * Update Jira when a stage passes — comment with quality score.
 */
export async function onStagePass(
  jiraKey: string,
  stageId: string,
  agentName: string,
  model: string,
  duration: number | undefined,
  qualityScore: QualityScore | undefined,
  retryCount: number,
): Promise<void> {
  try {
    const lines: string[] = [
      `Agent: ${agentName} (${model})`,
    ];
    if (duration) lines.push(`Duration: ${(duration / 1000).toFixed(1)}s`);
    if (retryCount > 0) lines.push(`Retries: ${retryCount}`);
    if (qualityScore) {
      lines.push(
        `\nQuality Score: ${qualityScore.overall}/10`,
        `  Completeness: ${qualityScore.completeness}`,
        `  Specificity: ${qualityScore.specificity}`,
        `  Actionability: ${qualityScore.actionability}`,
      );
    }

    await addComment(
      jiraKey,
      commentAdf(`Stage Passed: ${stageId}`, lines.join("\n")),
    );
  } catch {
    await logToSystem(`Jira sync failed: onStagePass(${jiraKey}, ${stageId})`);
  }
}

/**
 * Update Jira when a stage is escalated — comment with feedback, set priority.
 */
export async function onStageEscalation(
  jiraKey: string,
  stageId: string,
  agentName: string,
  score: number,
  feedback: string,
): Promise<void> {
  try {
    await addComment(
      jiraKey,
      commentAdf(
        `ESCALATION: ${stageId}`,
        `Agent: ${agentName}\nScore: ${score}/10 (below threshold after max retries)\n\nOrchestrator Feedback:\n${feedback}`,
      ),
    );
    // Try to transition to a blocked-like state (back to "To Do" with high priority indication)
    await tryTransition(jiraKey, "new");
  } catch {
    await logToSystem(`Jira sync failed: onStageEscalation(${jiraKey}, ${stageId})`);
  }
}

/**
 * Update Jira when checkpoint is reached — pause comment.
 */
export async function onCheckpointReached(jiraKey: string): Promise<void> {
  try {
    await addComment(
      jiraKey,
      commentAdf(
        "Human Checkpoint Reached",
        "Pipeline paused at Stage 4.5 — awaiting user approval before proceeding to QA.",
      ),
    );
  } catch {
    await logToSystem(`Jira sync failed: onCheckpointReached(${jiraKey})`);
  }
}

/**
 * Update Jira when checkpoint is approved/rejected.
 */
export async function onCheckpointDecision(
  jiraKey: string,
  approved: boolean,
  reason?: string,
): Promise<void> {
  try {
    if (approved) {
      await addComment(
        jiraKey,
        commentAdf("Checkpoint Approved", "User approved — pipeline resuming from QA stage."),
      );
      await tryTransition(jiraKey, "indeterminate");
    } else {
      await addComment(
        jiraKey,
        commentAdf(
          "Checkpoint Rejected",
          `User rejected pipeline execution.\nReason: ${reason || "No reason provided"}`,
        ),
      );
    }
  } catch {
    await logToSystem(`Jira sync failed: onCheckpointDecision(${jiraKey})`);
  }
}

/**
 * Finalize the Jira issue when pipeline completes — post summary + transition to Done.
 */
export async function finalizePipeline(
  jiraKey: string,
  execution: PipelineExecution,
): Promise<void> {
  try {
    const stepSummaries = Object.values(execution.stepResults)
      .map((r) => {
        let line = `${r.stepId}: ${r.status}`;
        if (r.duration) line += ` (${(r.duration / 1000).toFixed(1)}s)`;
        if (r.retryCount) line += ` [${r.retryCount} retries]`;
        if (r.escalated) line += ` [ESCALATED]`;
        return line;
      })
      .join("\n");

    const scoreSummary = execution.qualityScores
      ? Object.entries(execution.qualityScores)
          .map(([id, s]) => `${id}: ${s.overall}/10`)
          .join("\n")
      : "No scores recorded";

    const summary = [
      `Status: ${execution.status.toUpperCase()}`,
      `Duration: ${execution.totalDuration ? (execution.totalDuration / 1000).toFixed(1) + "s" : "N/A"}`,
      execution.escalatedSteps?.length ? `Escalated Steps: ${execution.escalatedSteps.join(", ")}` : null,
      `\nStage Results:\n${stepSummaries}`,
      `\nQuality Scores:\n${scoreSummary}`,
    ]
      .filter(Boolean)
      .join("\n");

    await addComment(
      jiraKey,
      commentAdf(
        `Pipeline ${execution.status === "completed" ? "Completed" : "Finished"}: ${execution.workflowName}`,
        summary,
      ),
    );

    // Transition to Done if completed, back to To Do if failed
    if (execution.status === "completed") {
      await tryTransition(jiraKey, "done");
    } else {
      await tryTransition(jiraKey, "new");
    }
  } catch {
    await logToSystem(`Jira sync failed: finalizePipeline(${jiraKey})`);
  }
}

// --- Internal logging helper ---

async function logToSystem(content: string, metadata?: Record<string, unknown>): Promise<void> {
  try {
    await addLog({ type: "system", agentName: "Jira Sync", content, metadata });
  } catch {
    // Best-effort logging
  }
}
