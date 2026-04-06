"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { GraphNode, GraphLink } from "@/app/api/knowledge-map/route";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// ── Color palette ──

const TYPE_COLORS: Record<string, string> = {
  skill: "#6366f1",  // indigo
  agent: "#10b981",  // emerald
  kb: "#f59e0b",     // amber
};

const GROUP_COLORS: Record<string, string> = {
  // skill scopes
  planning: "#818cf8",
  implementation: "#6366f1",
  validation: "#a78bfa",
  deployment: "#c084fc",
  research: "#e879f9",
  // agent teams
  "beauty-crm": "#10b981",
  personal: "#34d399",
  herald: "#6ee7b7",
  // kb categories
  "failure-patterns": "#ef4444",
  "success-patterns": "#22c55e",
  "security-playbook": "#f97316",
  "architecture-patterns": "#3b82f6",
  "tech-decisions": "#8b5cf6",
};

const LINK_COLORS: Record<string, string> = {
  conflict: "#ef4444",
  team: "#10b981",
  "agent-skill": "#6366f1",
  "kb-agent": "#f59e0b",
  "kb-tag": "#fbbf24",
  domain: "#94a3b8",
};

interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  filter: Set<string>; // "skill" | "agent" | "kb"
  searchQuery: string;
  onNodeClick?: (node: GraphNode) => void;
}

export function ForceGraphView({ nodes, links, filter, searchQuery, onNodeClick }: ForceGraphProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Configure forces ASAP (no reheat — just adjust running simulation)
  const forcesApplied = useRef(false);
  useEffect(() => {
    if (forcesApplied.current) return;
    const timer = setInterval(() => {
      const fg = graphRef.current;
      if (!fg) return;
      fg.d3Force("charge")?.strength(-50).distanceMax(150);
      fg.d3Force("link")?.distance(25).strength(0.6);
      fg.d3Force("center")?.strength(0.15);
      forcesApplied.current = true;
      clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Filter nodes — memoized to prevent re-render on hover from recreating graphData
  const graphData = useMemo(() => {
    const filteredNodes = nodes.filter((n) => {
      if (!filter.has(n.type)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.name.toLowerCase().includes(q) || n.group.toLowerCase().includes(q);
      }
      return true;
    });
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = links.filter((l) => {
      const sid = typeof l.source === "string" ? l.source : (l.source as any).id;
      const tid = typeof l.target === "string" ? l.target : (l.target as any).id;
      return nodeIds.has(sid) && nodeIds.has(tid);
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [nodes, links, filter, searchQuery]);

  const nodeColor = useCallback((node: any) => {
    return GROUP_COLORS[node.group] || TYPE_COLORS[node.type] || "#94a3b8";
  }, []);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = Math.sqrt(node.val || 3) * 3.5;
    const isHovered = hoveredNode?.id === node.id;
    const fontSize = Math.max(12 / globalScale, 2);

    // Outer glow (always visible, stronger on hover)
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + (isHovered ? 6 : 3), 0, 2 * Math.PI);
    ctx.fillStyle = isHovered ? `${nodeColor(node)}55` : `${nodeColor(node)}18`;
    ctx.fill();

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor(node);
    ctx.fill();

    // Border
    ctx.strokeStyle = isHovered ? "#fff" : `${nodeColor(node)}cc`;
    ctx.lineWidth = isHovered ? 2.5 / globalScale : 1 / globalScale;
    ctx.stroke();

    // Type icon (letter in center)
    const letter = node.type === "skill" ? "S" : node.type === "agent" ? "A" : "K";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${fontSize * 0.9}px monospace`;
    ctx.fillText(letter, node.x, node.y);

    // Label below — always show for agents, show for others at zoom > 1.0
    if (globalScale > 1.0 || isHovered || node.type === "agent") {
      ctx.fillStyle = isHovered ? "#f8fafc" : "#cbd5e1";
      ctx.font = `${fontSize * 0.75}px sans-serif`;
      ctx.fillText(node.name, node.x, node.y + size + fontSize * 0.7);
    }
  }, [hoveredNode, nodeColor]);

  const linkColor = useCallback((link: any) => {
    return LINK_COLORS[link.type] || "#334155";
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const size = Math.sqrt(node.val || 3) * 3.5 + 5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkColor={linkColor}
        linkWidth={(link: any) => link.type === "conflict" ? 2.5 : link.type === "team" || link.type === "agent-skill" ? 1.8 : 1}
        linkLineDash={(link: any) => link.type === "conflict" ? [5, 3] : []}
        linkDirectionalParticles={(link: any) => link.type === "agent-skill" ? 2 : 0}
        linkDirectionalParticleWidth={2.5}
        linkLabel={(link: any) => link.label || ""}
        linkCurvature={0}
        onNodeHover={(node: any) => setHoveredNode(node || null)}
        onNodeClick={(node: any) => onNodeClick?.(node)}
        onEngineStop={() => {
          // Freeze all node positions so graph never drifts
          const fg = graphRef.current;
          if (fg) {
            graphData.nodes.forEach((n: any) => {
              n.fx = n.x;
              n.fy = n.y;
            });
          }
        }}
        cooldownTime={3000}
        d3AlphaDecay={0.04}
        d3VelocityDecay={0.4}
        backgroundColor="transparent"
      />

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 max-w-xs pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColor(hoveredNode) }} />
            <span className="font-mono text-xs font-bold text-white">{hoveredNode.name}</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400 space-y-0.5">
            <div>Type: <span className="text-slate-300">{hoveredNode.type}</span></div>
            <div>Group: <span className="text-slate-300">{hoveredNode.group}</span></div>
            {hoveredNode.meta?.role != null && <div>Role: <span className="text-slate-300">{String(hoveredNode.meta.role)}</span></div>}
            {hoveredNode.meta?.domains != null && <div>Domains: <span className="text-slate-300">{String((hoveredNode.meta.domains as string[]).join(", "))}</span></div>}
            {hoveredNode.meta?.severity != null && <div>Severity: <span className="text-slate-300">{String(hoveredNode.meta.severity)}</span></div>}
            {hoveredNode.meta?.tags != null && <div>Tags: <span className="text-slate-300">{String((hoveredNode.meta.tags as string[]).join(", "))}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
