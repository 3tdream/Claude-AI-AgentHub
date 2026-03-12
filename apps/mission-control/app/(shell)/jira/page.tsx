"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  Search,
  Plus,
  ExternalLink,
  Loader2,
  TicketCheck,
  AlertCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  JiraProject,
  JiraIssue,
  JiraSearchResult,
} from "@/lib/jira/types";
import {
  STATUS_COLORS,
  PRIORITY_COLORS,
  ISSUE_TYPE_COLORS,
} from "@/lib/jira/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function StatusBadge({ status }: { status: JiraIssue["fields"]["status"] }) {
  const colors = STATUS_COLORS[status.statusCategory.colorName] ?? {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        colors.bg,
        colors.text,
      )}
    >
      {status.name}
    </span>
  );
}

function PriorityBadge({ name }: { name: string }) {
  const colors = PRIORITY_COLORS[name] ?? {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        colors.bg,
        colors.text,
      )}
    >
      {name}
    </span>
  );
}

function TypeBadge({ name }: { name: string }) {
  const colors = ISSUE_TYPE_COLORS[name] ?? {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
        colors.bg,
        colors.text,
      )}
    >
      {name}
    </span>
  );
}

function CreateIssueModal({
  projectKey,
  onClose,
  onCreated,
}: {
  projectKey: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("Task");
  const [priority, setPriority] = useState("Medium");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/jira/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            project: { key: projectKey },
            summary: summary.trim(),
            description: description.trim()
              ? {
                  type: "doc",
                  version: 1,
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: description.trim() }],
                    },
                  ],
                }
              : undefined,
            issuetype: { name: issueType },
            priority: { name: priority },
          },
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">
          Create Issue in {projectKey}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {["Task", "Bug", "Story", "Epic"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {["Highest", "High", "Medium", "Low", "Lowest"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Summary *
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Issue summary"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!summary.trim() || creating}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JiraPage() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: configData } = useSWR("/api/jira/config", fetcher, {
    revalidateOnFocus: false,
  });
  const isConfigured = configData?.configured ?? true; // default true to avoid flash

  const { data: projectsData, isLoading: loadingProjects } = useSWR(
    "/api/jira/projects",
    fetcher,
    { revalidateOnFocus: false },
  );

  const projects: JiraProject[] = projectsData?.data ?? [];

  const issuesUrl = selectedProject
    ? `/api/jira/issues?project=${selectedProject}${statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`
    : null;

  const {
    data: issuesData,
    isLoading: loadingIssues,
    mutate: mutateIssues,
  } = useSWR(issuesUrl, fetcher, { revalidateOnFocus: false });

  const searchResult: JiraSearchResult | null = issuesData?.data ?? null;
  const issues: JiraIssue[] = searchResult?.issues ?? [];

  const handleProjectChange = useCallback(
    (key: string) => {
      setSelectedProject(key);
      setStatusFilter("");
      setSearchQuery("");
    },
    [],
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jira Issues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage project issues from Jira
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedProject && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Issue
            </button>
          )}
          <Link
            href="/jira/settings"
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            title="Jira Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedProject}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
        >
          <option value="">Select project...</option>
          {projects.map((p) => (
            <option key={p.key} value={p.key}>
              {p.key} — {p.name}
            </option>
          ))}
        </select>

        {selectedProject && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues..."
                className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {!isConfigured && configData ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md text-center space-y-4">
            <Settings className="w-10 h-10 mx-auto text-muted-foreground opacity-40" />
            <div>
              <h2 className="text-lg font-semibold">Jira Not Configured</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set up your Jira credentials to start managing issues.
              </p>
            </div>
            <Link
              href="/jira/settings"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configure Jira
            </Link>
          </div>
        </div>
      ) : loadingProjects ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !selectedProject ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <TicketCheck className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Select a project to view issues</p>
        </div>
      ) : loadingIssues ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : issuesData?.error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-400">
          <AlertCircle className="w-8 h-8 mb-3" />
          <p className="text-sm">{issuesData.error}</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <TicketCheck className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">No issues found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono">
            {searchResult?.total} issues
          </p>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Key</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Summary</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Priority</th>
                  <th className="text-left px-4 py-3 font-medium">Assignee</th>
                  <th className="text-left px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`${process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "#"}/browse/${issue.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {issue.key}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge name={issue.fields.issuetype.name} />
                    </td>
                    <td className="px-4 py-3 text-sm max-w-md truncate">
                      {issue.fields.summary}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={issue.fields.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge name={issue.fields.priority.name} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {issue.fields.assignee?.displayName ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {formatDate(issue.fields.updated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && selectedProject && (
        <CreateIssueModal
          projectKey={selectedProject}
          onClose={() => setShowCreate(false)}
          onCreated={() => mutateIssues()}
        />
      )}
    </div>
  );
}
