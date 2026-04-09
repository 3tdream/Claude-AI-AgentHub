"use client";

import { useState } from "react";
import {
  FolderOpen, MessageSquare, GitFork, FlaskConical, Brain,
  ClipboardList, Hammer, Shield, Server, Palette, Monitor,
  Search, Rocket, CheckCircle2, PauseCircle, ArrowDown,
  ArrowRight, Zap, Download, Eye,
  BookOpen, ChevronDown, ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ══════════════════════════════════════════════
// USER JOURNEY STEPS (before pipeline)
// ══════════════════════════════════════════════

interface JourneyStep {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;      // bg
  textColor: string;
  borderColor: string;
  userAction?: boolean; // step done by user (vs system)
}

const USER_JOURNEY: JourneyStep[] = [
  {
    id: "select-project",
    label: "Select Project",
    description: "Choose target project from your workspace",
    icon: FolderOpen,
    color: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    userAction: true,
  },
  {
    id: "describe-task",
    label: "Describe Task",
    description: "Type what you need — bug fix, feature, refactor",
    icon: MessageSquare,
    color: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    userAction: true,
  },
  {
    id: "smart-routing",
    label: "Smart Routing",
    description: "System analyzes complexity and picks the right mode",
    icon: GitFork,
    color: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
  },
];

// ══════════════════════════════════════════════
// ROUTING MODES
// ══════════════════════════════════════════════

interface RouteMode {
  id: string;
  label: string;
  stages: string;
  description: string;
  color: string;
}

const ROUTE_MODES: RouteMode[] = [
  { id: "direct", label: "Direct", stages: "Claude Code", description: "Simple edits — executed immediately, no pipeline", color: "text-slate-600" },
  { id: "quick", label: "Quick Fix", stages: "2-3 stages", description: "Bug fixes, small changes — skip to implementation", color: "text-emerald-600" },
  { id: "medium", label: "Medium", stages: "5-8 stages", description: "Features — skip research, start from architecture", color: "text-amber-600" },
  { id: "full", label: "Full Pipeline", stages: "All 16 stages", description: "Complex features — full discovery to deployment", color: "text-violet-600" },
];

// ══════════════════════════════════════════════
// PIPELINE PHASES
// ══════════════════════════════════════════════

interface Stage {
  id: string;
  label: string;
  agent: string;
  icon: LucideIcon;
  isGate?: boolean;
  isCheckpoint?: boolean;
}

interface Phase {
  id: string;
  label: string;
  color: string;
  borderColor: string;
  textColor: string;
  stages: Stage[];
}

// Keep in sync with CRM_PIPELINE_STAGES in lib/pipeline-templates.ts
const PHASES: Phase[] = [
  {
    id: "discovery",
    label: "Discovery",
    color: "bg-violet-50",
    borderColor: "border-violet-200",
    textColor: "text-violet-700",
    stages: [
      { id: "s0", label: "Research", agent: "Research", icon: FlaskConical },
    ],
  },
  {
    id: "planning",
    label: "Planning",
    color: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    stages: [
      { id: "s1", label: "Requirements", agent: "Orchestrator", icon: Brain, isCheckpoint: true },
      { id: "s2", label: "PRD", agent: "PM", icon: ClipboardList },
      { id: "s2.5", label: "PRD Gate", agent: "Orchestrator", icon: Brain, isGate: true },
    ],
  },
  {
    id: "architecture",
    label: "Architecture",
    color: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    stages: [
      { id: "s3.1", label: "ADR", agent: "Architect", icon: Hammer },
      { id: "s3.2", label: "API Design", agent: "Architect", icon: Hammer },
      { id: "s3.3", label: "ERD", agent: "Architect", icon: Hammer },
      { id: "s3.4", label: "File Plan", agent: "Architect", icon: Hammer },
      { id: "s4", label: "Security Review", agent: "Cyber", icon: Shield },
      { id: "s4.5", label: "Arch Gate", agent: "Orchestrator", icon: Brain, isGate: true },
    ],
  },
  {
    id: "implementation",
    label: "Implementation",
    color: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    stages: [
      { id: "s5", label: "Backend", agent: "Backend", icon: Server },
      { id: "s6", label: "Design System", agent: "Designer", icon: Palette },
      { id: "s7", label: "Frontend", agent: "Frontend", icon: Monitor },
    ],
  },
  {
    id: "qa",
    label: "Quality Assurance",
    color: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-700",
    stages: [
      { id: "s8", label: "Tech QA", agent: "QA", icon: Search },
      { id: "s8.5", label: "Tech Review", agent: "Orchestrator", icon: Brain, isGate: true },
      { id: "s9", label: "Business QA", agent: "QA", icon: Search },
      { id: "s10", label: "Cyber Audit", agent: "Cyber", icon: Shield },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    color: "bg-sky-50",
    borderColor: "border-sky-200",
    textColor: "text-sky-700",
    stages: [
      { id: "s11", label: "Final Verdict", agent: "Orchestrator", icon: Brain, isGate: true },
      { id: "s12a", label: "DevOps", agent: "DevOps", icon: Rocket },
      { id: "s12b", label: "Consolidation", agent: "Orchestrator", icon: Brain },
    ],
  },
];

// ══════════════════════════════════════════════
// POST-PIPELINE STEPS
// ══════════════════════════════════════════════

const POST_PIPELINE: JourneyStep[] = [
  {
    id: "review",
    label: "Review Results",
    description: "Inspect each stage output, quality scores, and agent reasoning",
    icon: Eye,
    color: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    userAction: true,
  },
  {
    id: "export",
    label: "Export / Deploy Files",
    description: "Download generated code or apply files directly to your project",
    icon: Download,
    color: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    userAction: true,
  },
  {
    id: "kb-learn",
    label: "KB Learning",
    description: "System saves patterns, failures, and decisions for future runs",
    icon: BookOpen,
    color: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
];

// ══════════════════════════════════════════════
// DERIVED STATS (keep in sync automatically)
// ══════════════════════════════════════════════

const allStages = PHASES.flatMap((p) => p.stages);
const STATS = [
  { value: new Set(allStages.map((s) => s.agent)).size, label: "AI agents" },
  { value: ROUTE_MODES.length, label: "routing modes" },
  { value: allStages.length, label: "stages" },
  { value: allStages.filter((s) => s.isGate).length, label: "quality gates" },
];

// ══════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════

function JourneyStepCard({ step }: { step: JourneyStep }) {
  return (
    <div className={`${step.color} ${step.borderColor} border rounded-lg p-2.5 flex items-start gap-2.5 min-w-[200px]`}>
      <div className={`w-7 h-7 rounded-lg ${step.color} border ${step.borderColor} flex items-center justify-center flex-shrink-0`}>
        <step.icon className={`w-4 h-4 ${step.textColor}`} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${step.textColor}`}>{step.label}</span>
          {step.userAction && (
            <span className="text-[9px] font-mono bg-slate-200 text-slate-500 px-1 rounded">YOU</span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{step.description}</p>
      </div>
    </div>
  );
}

export function PipelineFlowDiagram() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-5">
      {/* Header — always visible, clickable to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 group cursor-pointer"
      >
        <div className="text-center space-y-0.5">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
            How It Works
          </h3>
          <p className="text-sm text-slate-500">
            Your task goes through a complete AI pipeline — from idea to deployed code
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
        )}
      </button>

      {/* Collapsed summary */}
      {!expanded && (
        <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 mt-2">
          {STATS.map((s) => (
            <div key={s.label}><span className="font-mono font-bold text-slate-600">{s.value}</span> {s.label}</div>
          ))}
          <div><span className="font-mono font-bold text-slate-600">~3 min</span> full run</div>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-500 font-medium">Click to expand</span>
        </div>
      )}

      {/* Expandable content */}
      {expanded && (
        <div className="space-y-5 mt-4 overflow-y-auto max-h-[calc(100vh-26rem)]">

      {/* ── SECTION 1: User Input ── */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 1 — Your Input</div>
        <div className="flex items-center gap-2">
          {USER_JOURNEY.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <JourneyStepCard step={step} />
              {i < USER_JOURNEY.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Routing modes ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-indigo-300" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Smart Router Decides</div>
        </div>
        <div className="flex items-center gap-3 pl-6">
          {ROUTE_MODES.map((mode) => (
            <div key={mode.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-[180px]">
              <Zap className={`w-3.5 h-3.5 ${mode.color} flex-shrink-0`} />
              <div>
                <div className={`text-xs font-semibold ${mode.color}`}>
                  {mode.label} <span className="text-slate-400 font-normal">({mode.stages})</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{mode.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: Pipeline Execution ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-slate-300" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 2 — AI Pipeline (Full Mode)</div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 pl-6 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <span>Agent Stage</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-500" />
            <span>Quality Gate</span>
          </div>
          <div className="flex items-center gap-1">
            <PauseCircle className="w-3 h-3 text-blue-500" />
            <span>User Checkpoint</span>
          </div>
        </div>

        {/* Pipeline phases */}
        <div className="flex items-start gap-0 overflow-x-auto pb-2 pl-6">
          {PHASES.map((phase, phaseIdx) => (
            <div key={phase.id} className="flex items-start">
              <div className={`${phase.color} ${phase.borderColor} border rounded-xl p-2.5 min-w-[140px] max-w-[170px]`}>
                <div className={`text-[10px] font-bold ${phase.textColor} uppercase tracking-wider mb-1.5`}>
                  {phase.label}
                </div>
                <div className="space-y-1">
                  {phase.stages.map((stage, stageIdx) => (
                    <div key={stage.id} className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        stage.isGate
                          ? "bg-amber-100 border border-amber-300"
                          : stage.isCheckpoint
                            ? "bg-blue-100 border border-blue-300"
                            : `${phase.color} ${phase.borderColor} border`
                      }`}>
                        {stage.isGate ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                        ) : stage.isCheckpoint ? (
                          <PauseCircle className="w-2.5 h-2.5 text-blue-600" />
                        ) : (
                          <stage.icon className={`w-2.5 h-2.5 ${phase.textColor}`} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-slate-700 leading-tight truncate">{stage.label}</div>
                        <div className="text-[9px] text-slate-400 leading-tight truncate">{stage.agent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {phaseIdx < PHASES.length - 1 && (
                <div className="flex items-center self-center px-1 mt-6">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: After Pipeline ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-slate-300" />
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 3 — Results & Deploy</div>
        </div>
        <div className="flex items-center gap-2 pl-6">
          {POST_PIPELINE.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <JourneyStepCard step={step} />
              {i < POST_PIPELINE.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 border-t border-slate-100 pt-3">
        {STATS.map((s) => (
          <div key={s.label}><span className="font-mono font-bold text-slate-600">{s.value}</span> {s.label}</div>
        ))}
        <div><span className="font-mono font-bold text-slate-600">~3 min</span> full run</div>
      </div>

        </div>
      )}
    </div>
  );
}
