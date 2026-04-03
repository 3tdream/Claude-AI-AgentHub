"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { PipelineExecution, WorkflowStep, StepStatus } from "@/types";

interface Pipeline3DProps {
  steps: WorkflowStep[];
  execution: PipelineExecution;
  onSelectStage: (stageId: string) => void;
  selectedStageId: string | null;
}

// ── Colors by status ──
const STATUS_COLORS: Record<StepStatus, { fill: string; glow: string; text: string }> = {
  pending: { fill: "#94a3b8", glow: "rgba(148,163,184,0.3)", text: "#64748b" },
  running: { fill: "#6366f1", glow: "rgba(99,102,241,0.5)", text: "#4f46e5" },
  completed: { fill: "#10b981", glow: "rgba(16,185,129,0.4)", text: "#059669" },
  failed: { fill: "#ef4444", glow: "rgba(239,68,68,0.4)", text: "#dc2626" },
  skipped: { fill: "#cbd5e1", glow: "rgba(203,213,225,0.2)", text: "#94a3b8" },
  awaiting_approval: { fill: "#f59e0b", glow: "rgba(245,158,11,0.5)", text: "#d97706" },
  retrying: { fill: "#f97316", glow: "rgba(249,115,22,0.4)", text: "#ea580c" },
};

interface NodeLayout {
  id: string;
  agentName: string;
  status: StepStatus;
  x: number;
  y: number;
  col: number;
  row: number;
  isGate: boolean;
  isCheckpoint: boolean;
  dependsOn: string[];
}

interface Particle {
  fromId: string;
  toId: string;
  progress: number;
  speed: number;
}

function layoutNodes(steps: WorkflowStep[], results: Record<string, { status: StepStatus }>): NodeLayout[] {
  if (steps.length === 0) return [];

  // Topological sort into columns
  const cols: string[][] = [];

  // Assign columns by dependency depth
  const depthMap = new Map<string, number>();
  function getDepth(stepId: string): number {
    if (depthMap.has(stepId)) return depthMap.get(stepId)!;
    const step = steps.find((s) => s.id === stepId);
    if (!step || step.dependsOn.length === 0) { depthMap.set(stepId, 0); return 0; }
    const maxParent = Math.max(...step.dependsOn.map((d) => getDepth(d)));
    const depth = maxParent + 1;
    depthMap.set(stepId, depth);
    return depth;
  }
  steps.forEach((s) => getDepth(s.id));

  // Group by depth
  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  for (let d = 0; d <= maxDepth; d++) {
    cols[d] = steps.filter((s) => depthMap.get(s.id) === d).map((s) => s.id);
  }

  // Layout with spacing
  const NODE_W = 100;
  const NODE_H = 60;
  const COL_GAP = 140;
  const ROW_GAP = 70;
  const PADDING = 60;

  const nodes: NodeLayout[] = [];

  for (let col = 0; col < cols.length; col++) {
    const group = cols[col];
    const groupHeight = group.length * ROW_GAP;
    const startY = -groupHeight / 2 + ROW_GAP / 2;

    for (let row = 0; row < group.length; row++) {
      const stepId = group[row];
      const step = steps.find((s) => s.id === stepId)!;
      const result = results[stepId];
      const isGate = stepId.includes("-gate") || stepId.includes("verdict") || stepId.includes("consolidation");
      const isCheckpoint = !!step.metadata?.isCheckpoint;

      nodes.push({
        id: stepId,
        agentName: step.agentName,
        status: result?.status || "pending",
        x: PADDING + col * COL_GAP,
        y: startY + row * ROW_GAP,
        col,
        row,
        isGate,
        isCheckpoint,
        dependsOn: step.dependsOn.filter((d) => steps.some((s) => s.id === d)),
      });
    }
  }

  // Center vertically
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxY = Math.max(...nodes.map((n) => n.y));
  const offsetY = -(minY + maxY) / 2;
  nodes.forEach((n) => (n.y += offsetY));

  return nodes;
}

export function Pipeline3D({ steps, execution, onSelectStage, selectedStageId }: Pipeline3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NodeLayout[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 400 });
  const hoverRef = useRef<string | null>(null);
  const timeRef = useRef(0);

  // Serialize step statuses for change detection (reference comparison won't work)
  const stepStatusKey = JSON.stringify(
    Object.entries(execution.stepResults).map(([id, r]) => `${id}:${r.status}`).sort()
  );

  // Layout nodes when steps/execution change
  useEffect(() => {
    const results: Record<string, { status: StepStatus }> = {};
    for (const [id, r] of Object.entries(execution.stepResults)) {
      results[id] = { status: r.status };
    }
    nodesRef.current = layoutNodes(steps, results);

    // Create particles for active connections (completed → next running/pending)
    const particles: Particle[] = [];
    for (const node of nodesRef.current) {
      if (node.status === "running" || node.status === "retrying") {
        for (const dep of node.dependsOn) {
          const parent = nodesRef.current.find((n) => n.id === dep);
          if (parent && parent.status === "completed") {
            for (let i = 0; i < 3; i++) {
              particles.push({
                fromId: dep,
                toId: node.id,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.004,
              });
            }
          }
        }
      }
    }
    particlesRef.current = particles;
  }, [steps, stepStatusKey]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const nodes = nodesRef.current;
    const cx = canvasSize.w / 2;
    const cy = canvasSize.h / 2;

    for (const node of nodes) {
      const nx = cx + node.x;
      const ny = cy + node.y;
      const r = node.isGate ? 18 : 24;
      if (Math.hypot(mx - nx, my - ny) < r + 5) {
        onSelectStage(node.id);
        return;
      }
    }
  }, [canvasSize, onSelectStage]);

  // Mouse move for hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const nodes = nodesRef.current;
    const cx = canvasSize.w / 2;
    const cy = canvasSize.h / 2;

    let found = false;
    for (const node of nodes) {
      const nx = cx + node.x;
      const ny = cy + node.y;
      const r = node.isGate ? 18 : 24;
      if (Math.hypot(mx - nx, my - ny) < r + 5) {
        hoverRef.current = node.id;
        canvas.style.cursor = "pointer";
        found = true;
        break;
      }
    }
    if (!found) {
      hoverRef.current = null;
      canvas.style.cursor = "default";
    }
  }, [canvasSize]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    ctx.scale(dpr, dpr);

    function draw() {
      if (!ctx) return;
      const W = canvasSize.w;
      const H = canvasSize.h;
      const cx = W / 2;
      const cy = H / 2;
      const nodes = nodesRef.current;
      const particles = particlesRef.current;
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
      bg.addColorStop(0, "#f8fafc");
      bg.addColorStop(1, "#f1f5f9");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Draw connections
      for (const node of nodes) {
        for (const depId of node.dependsOn) {
          const parent = nodes.find((n) => n.id === depId);
          if (!parent) continue;

          const x1 = cx + parent.x;
          const y1 = cy + parent.y;
          const x2 = cx + node.x;
          const y2 = cy + node.y;

          const parentColors = STATUS_COLORS[parent.status] || STATUS_COLORS.pending;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          // Bezier curve for smooth connections
          const midX = (x1 + x2) / 2;
          ctx.bezierCurveTo(midX, y1, midX, y2, x2, y2);
          ctx.strokeStyle = parent.status === "completed" ? "rgba(16,185,129,0.3)" : "rgba(148,163,184,0.15)";
          ctx.lineWidth = parent.status === "completed" ? 2 : 1;
          ctx.stroke();
        }
      }

      // Draw particles on connections
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        if (p.progress > 1) p.progress -= 1;

        const from = nodes.find((n) => n.id === p.fromId);
        const to = nodes.find((n) => n.id === p.toId);
        if (!from || !to) continue;

        const x1 = cx + from.x;
        const y1 = cy + from.y;
        const x2 = cx + to.x;
        const y2 = cy + to.y;
        const midX = (x1 + x2) / 2;

        // Bezier interpolation
        const t2 = p.progress;
        const mt = 1 - t2;
        const px = mt * mt * mt * x1 + 3 * mt * mt * t2 * midX + 3 * mt * t2 * t2 * midX + t2 * t2 * t2 * x2;
        const py = mt * mt * mt * y1 + 3 * mt * mt * t2 * y1 + 3 * mt * t2 * t2 * y2 + t2 * t2 * t2 * y2;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,0.7)";
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,0.15)";
        ctx.fill();
      }

      // Draw nodes
      for (const node of nodes) {
        const nx = cx + node.x;
        const ny = cy + node.y;
        const colors = STATUS_COLORS[node.status] || STATUS_COLORS.pending;
        const isSelected = selectedStageId === node.id;
        const isHovered = hoverRef.current === node.id;
        const r = node.isGate ? 18 : 24;

        // Glow for running nodes
        if (node.status === "running" || node.status === "retrying") {
          const pulseR = r + 8 + Math.sin(t * 3) * 4;
          ctx.beginPath();
          ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = colors.glow;
          ctx.fill();
        }

        // Selection ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#6366f1";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Hover ring
        if (isHovered && !isSelected) {
          ctx.beginPath();
          ctx.arc(nx, ny, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(99,102,241,0.3)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Node body
        ctx.beginPath();
        if (node.isGate) {
          // Diamond shape for gates
          ctx.moveTo(nx, ny - r);
          ctx.lineTo(nx + r, ny);
          ctx.lineTo(nx, ny + r);
          ctx.lineTo(nx - r, ny);
          ctx.closePath();
        } else {
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
        }
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = colors.fill;
        ctx.lineWidth = node.status === "running" ? 3 : 2;
        ctx.stroke();

        // Inner circle with status color
        ctx.beginPath();
        if (node.isGate) {
          ctx.arc(nx, ny, r * 0.5, 0, Math.PI * 2);
        } else {
          ctx.arc(nx, ny, r * 0.6, 0, Math.PI * 2);
        }
        ctx.fillStyle = colors.fill;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Status icon
        ctx.font = "bold 10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = colors.fill;
        if (node.status === "completed") ctx.fillText("✓", nx, ny);
        else if (node.status === "failed") ctx.fillText("✗", nx, ny);
        else if (node.status === "running") ctx.fillText("●", nx, ny);
        else if (node.status === "awaiting_approval") ctx.fillText("⏸", nx, ny);
        else if (node.isGate) ctx.fillText("◆", nx, ny);
        else ctx.fillText("○", nx, ny);

        // Label below node
        ctx.font = "500 10px system-ui";
        ctx.textAlign = "center";
        ctx.fillStyle = isSelected || isHovered ? colors.text : "#64748b";
        const label = node.agentName.length > 14 ? node.agentName.substring(0, 12) + "…" : node.agentName;
        ctx.fillText(label, nx, ny + r + 14);

        // Stage ID above node
        ctx.font = "9px monospace";
        ctx.fillStyle = "#94a3b8";
        const stageLabel = node.id.replace(/^s/, "S").replace(/-.*/, "");
        ctx.fillText(stageLabel, nx, ny - r - 8);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [canvasSize, selectedStageId, steps, stepStatusKey]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize.w, height: canvasSize.h }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}
