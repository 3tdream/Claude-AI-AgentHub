"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { PipelineExecution, WorkflowStep, StepStatus } from "@/types";

// ─── Public interface — unchanged so all callers keep working ─────────────────
interface Pipeline3DProps {
  steps: WorkflowStep[];
  execution: PipelineExecution;
  onSelectStage: (stageId: string) => void;
  selectedStageId: string | null;
}

// ─── Status palette (extended with per-channel RGB for radial gradients) ──────
const STATUS_COLORS: Record<
  StepStatus,
  { fill: string; top: string; side: string; glow: string; text: string; r: number; g: number; b: number }
> = {
  pending:           { fill: "#94a3b8", top: "#cbd5e1", side: "#64748b", glow: "rgba(148,163,184,0.35)", text: "#64748b",  r: 148, g: 163, b: 184 },
  running:           { fill: "#6366f1", top: "#818cf8", side: "#4338ca", glow: "rgba(99,102,241,0.55)",  text: "#4f46e5",  r: 99,  g: 102, b: 241 },
  completed:         { fill: "#10b981", top: "#34d399", side: "#059669", glow: "rgba(16,185,129,0.45)",  text: "#059669",  r: 16,  g: 185, b: 129 },
  failed:            { fill: "#ef4444", top: "#f87171", side: "#b91c1c", glow: "rgba(239,68,68,0.45)",   text: "#dc2626",  r: 239, g: 68,  b: 68  },
  skipped:           { fill: "#cbd5e1", top: "#e2e8f0", side: "#94a3b8", glow: "rgba(203,213,225,0.25)", text: "#94a3b8",  r: 203, g: 213, b: 225 },
  awaiting_approval: { fill: "#f59e0b", top: "#fcd34d", side: "#b45309", glow: "rgba(245,158,11,0.50)", text: "#d97706",  r: 245, g: 158, b: 11  },
  retrying:          { fill: "#f97316", top: "#fb923c", side: "#c2410c", glow: "rgba(249,115,22,0.45)",  text: "#ea580c",  r: 249, g: 115, b: 22  },
};

// ─── Internal types ───────────────────────────────────────────────────────────

/** World-space node with projected screen coords filled each frame */
interface IsoNode {
  id: string;
  agentName: string;
  status: StepStatus;
  wx: number;   // isometric world X (left-right axis)
  wy: number;   // isometric world Y (depth axis)
  wz: number;   // isometric world Z (height) — elevated for running nodes
  col: number;
  row: number;
  isGate: boolean;
  isCheckpoint: boolean;
  dependsOn: string[];
  sx: number;   // projected screen X (updated each frame)
  sy: number;   // projected screen Y (updated each frame)
}

interface Particle {
  fromId: string;
  toId: string;
  progress: number;
  speed: number;
  lane: number; // 0-2 — slight lateral offset so streams don't overlap
}

// ─── Isometric projection constants ──────────────────────────────────────────
//
//  applyCamera(wx, wy, wz, cx, cy, scale) → { sx, sy }
//
//  Classic dimetric / "game" isometric:
//    sx = cx + (wx - wy) * TILE_W/2 * scale
//    sy = cy + (wx + wy) * TILE_H/2 * scale - wz * TILE_Z * scale
//
const TILE_W = 90;  // horizontal pixels per world unit
const TILE_H = 46;  // vertical pixels per world unit  (≈ TILE_W * sin30°)
const TILE_Z = 52;  // vertical pixels per Z unit

function applyCamera(
  wx: number, wy: number, wz: number,
  cx: number, cy: number, scale: number
): { sx: number; sy: number } {
  return {
    sx: cx + (wx - wy) * (TILE_W / 2) * scale,
    sy: cy + (wx + wy) * (TILE_H / 2) * scale - wz * TILE_Z * scale,
  };
}

/** Lerp a point along the isometric path between two world positions */
function isoLerp(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  t: number
): { wx: number; wy: number; wz: number } {
  return { wx: ax + (bx - ax) * t, wy: ay + (by - ay) * t, wz: az + (bz - az) * t };
}

// ─── Topological layout → isometric world positions ──────────────────────────
const ISO_COL_STEP = 2.8;  // world units between columns (X axis)
const ISO_ROW_STEP = 2.4;  // world units between rows    (Y axis)

function layoutNodes(
  steps: WorkflowStep[],
  results: Record<string, { status: StepStatus }>
): IsoNode[] {
  if (steps.length === 0) return [];

  // Depth via topological sort
  const depthMap = new Map<string, number>();
  function getDepth(id: string): number {
    if (depthMap.has(id)) return depthMap.get(id)!;
    const step = steps.find((s) => s.id === id);
    if (!step || step.dependsOn.length === 0) { depthMap.set(id, 0); return 0; }
    const d = Math.max(...step.dependsOn.map(getDepth)) + 1;
    depthMap.set(id, d);
    return d;
  }
  steps.forEach((s) => getDepth(s.id));

  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  const cols: string[][] = Array.from({ length: maxDepth + 1 }, () => []);
  steps.forEach((s) => cols[depthMap.get(s.id)!].push(s.id));

  const nodes: IsoNode[] = [];
  for (let col = 0; col < cols.length; col++) {
    const group = cols[col];
    for (let row = 0; row < group.length; row++) {
      const stepId = group[row];
      const step = steps.find((s) => s.id === stepId)!;
      const status: StepStatus = results[stepId]?.status ?? "pending";
      const isGate =
        stepId.includes("-gate") || stepId.includes("verdict") || stepId.includes("consolidation");
      const isCheckpoint = !!step.metadata?.isCheckpoint;
      // Centre each column's rows around Y=0; running nodes float above floor
      const rowOffset = (row - (group.length - 1) / 2) * ISO_ROW_STEP;
      const wz = status === "running" || status === "retrying" ? 0.55 : 0;
      nodes.push({
        id: stepId, agentName: step.agentName, status,
        wx: col * ISO_COL_STEP, wy: rowOffset, wz,
        col, row, isGate, isCheckpoint,
        dependsOn: step.dependsOn.filter((d) => steps.some((s) => s.id === d)),
        sx: 0, sy: 0,
      });
    }
  }
  return nodes;
}

export function Pipeline3D({ steps, execution, onSelectStage, selectedStageId }: Pipeline3DProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const nodesRef     = useRef<IsoNode[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const hoverRef     = useRef<string | null>(null);
  const timeRef      = useRef(0);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 480 });

  // Stable key for change detection
  const stepStatusKey = JSON.stringify(
    Object.entries(execution.stepResults).map(([id, r]) => `${id}:${r.status}`).sort()
  );

  // ── Rebuild layout + particles when pipeline state changes ──────────────────
  useEffect(() => {
    const results: Record<string, { status: StepStatus }> = {};
    for (const [id, r] of Object.entries(execution.stepResults)) results[id] = { status: r.status };
    nodesRef.current = layoutNodes(steps, results);

    // Particles flow on completed → running edges
    const particles: Particle[] = [];
    for (const node of nodesRef.current) {
      if (node.status === "running" || node.status === "retrying") {
        for (const dep of node.dependsOn) {
          const parent = nodesRef.current.find((n) => n.id === dep);
          if (parent && parent.status === "completed") {
            for (let lane = 0; lane < 3; lane++) {
              particles.push({
                fromId: dep, toId: node.id,
                progress: (lane / 3) + Math.random() * 0.15,
                speed: 0.0028 + Math.random() * 0.0035,
                lane,
              });
            }
          }
        }
      }
    }
    particlesRef.current = particles;
  }, [steps, stepStatusKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resize observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // ── Hit-test: screen coords → node id (uses pre-projected sx/sy) ───────────
  const hitTest = useCallback((mx: number, my: number): string | null => {
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const n = nodesRef.current[i];
      const r = n.isGate ? 16 : 20;
      if (Math.hypot(mx - n.sx, my - n.sy) < r + 6) return n.id;
    }
    return null;
  }, []);

  // ── Click ───────────────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (hit) onSelectStage(hit);
  }, [hitTest, onSelectStage]);

  // ── Hover ───────────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    hoverRef.current = hit;
    canvas.style.cursor = hit ? "pointer" : "default";
  }, [hitTest]);

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

      // Project all nodes to screen coordinates
      const scale = Math.min(W / ((nodesRef.current.length || 1) * 70), H / 300, 1.2);
      for (const node of nodes) {
        const floatZ = (node.status === "running" || node.status === "retrying")
          ? 0.55 + Math.sin(t * 2.5) * 0.15
          : node.wz;
        const proj = applyCamera(node.wx, node.wy, floatZ, cx, cy * 0.85, scale);
        node.sx = proj.sx;
        node.sy = proj.sy;
      }

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

          const x1 = parent.sx;
          const y1 = parent.sy;
          const x2 = node.sx;
          const y2 = node.sy;

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

        const x1 = from.sx;
        const y1 = from.sy;
        const x2 = to.sx;
        const y2 = to.sy;
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
        const nx = node.sx;
        const ny = node.sy;
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
