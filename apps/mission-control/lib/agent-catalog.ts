import type { AgentCatalogEntry, AgentDepartment } from "@/types";

export const AGENT_CATALOG: AgentCatalogEntry[] = [
  // Strategy
  {
    agentId: "orchestrator",
    agentName: "Orchestrator",
    department: "Strategy",
    description: "Coordinates multi-agent workflows, clarifies requirements, manages task flow",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 7.0,
  },
  {
    agentId: "pm-agent",
    agentName: "PM-Agent",
    department: "Strategy",
    description: "Creates PRDs, Jira epics/stories, manages project scope and timelines",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 7.5,
  },
  {
    agentId: "research-agent",
    agentName: "Research-Agent",
    department: "Strategy",
    description: "Market research, competitor analysis, technology evaluation",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 7.0,
  },

  // Engineering
  {
    agentId: "architect-agent",
    agentName: "Architect-Agent",
    department: "Engineering",
    description: "System architecture, ADRs, file structure planning, tech decisions",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 8.0,
  },
  {
    agentId: "backend-agent",
    agentName: "Backend-Agent",
    department: "Engineering",
    description: "API routes, database schemas, server-side logic, integrations",
    model: "gpt-5.1",
    provider: "openai",
    qualityThreshold: 8.0,
  },
  {
    agentId: "frontend-agent",
    agentName: "Frontend-Agent",
    department: "Engineering",
    description: "React components, UI implementation, styling, client-side state",
    model: "gpt-5.1",
    provider: "openai",
    qualityThreshold: 8.0,
  },
  {
    agentId: "designer-agent",
    agentName: "Designer-Agent",
    department: "Engineering",
    description: "UI/UX design, Figma specs, design tokens, component patterns",
    model: "gemini-2.5-pro",
    provider: "google",
    qualityThreshold: 7.5,
  },
  {
    agentId: "devops-agent",
    agentName: "DevOps-Agent",
    department: "Engineering",
    description: "CI/CD pipelines, deployment configs, infrastructure, Docker",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 7.0,
  },

  // Security
  {
    agentId: "cyber-agent",
    agentName: "Cyber-Agent",
    department: "Security",
    description: "Security audits, vulnerability scanning, OWASP checks, threat modeling",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 8.5,
  },
  {
    agentId: "qa-agent",
    agentName: "QA-Agent",
    department: "Security",
    description: "Quality evaluation, test plans, code review, bug detection",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 8.0,
  },

  // Support
  {
    agentId: "michael-personal-bot",
    agentName: "Personal Bot",
    department: "Support",
    description: "Telegram bot for personal tasks, reminders, and quick queries",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 6.0,
  },
  {
    agentId: "email-calendar-agent",
    agentName: "Email & Calendar",
    department: "Support",
    description: "Email management, calendar scheduling, Composio integrations",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 6.0,
  },
  {
    agentId: "tech-support-agent",
    agentName: "Tech Support",
    department: "Support",
    description: "Technical troubleshooting, environment setup, debugging assistance",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 6.5,
  },
  {
    agentId: "assistant-agent",
    agentName: "Assistant",
    department: "Support",
    description: "General-purpose assistant for miscellaneous tasks and research",
    model: "sonnet-4-6",
    provider: "anthropic",
    qualityThreshold: 6.0,
  },

  // Herald
  {
    agentId: "avatar-prompter",
    agentName: "Avatar Prompter",
    department: "Herald",
    description: "Generates avatar prompts for AI-generated profile images",
    model: "gpt-4.1-mini",
    provider: "openai",
    qualityThreshold: 6.0,
  },
  {
    agentId: "profile-generator",
    agentName: "Profile Generator",
    department: "Herald",
    description: "Generates agent profiles, bios, and persona descriptions",
    model: "gpt-4.1-mini",
    provider: "openai",
    qualityThreshold: 6.0,
  },
];

export const DEPARTMENTS: AgentDepartment[] = [
  "Strategy",
  "Engineering",
  "Security",
  "Support",
  "Herald",
];

export function getAgentsByDepartment(department: AgentDepartment): AgentCatalogEntry[] {
  return AGENT_CATALOG.filter((a) => a.department === department);
}

export function getAgentById(agentId: string): AgentCatalogEntry | undefined {
  return AGENT_CATALOG.find((a) => a.agentId === agentId);
}
