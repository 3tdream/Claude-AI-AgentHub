"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { ArchNode, ArchLink } from "@/app/api/knowledge-map/architecture/route";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// ── Color palette for architecture types ──

const TYPE_COLORS: Record<string, string> = {
  page: "#3b82f6",     // blue
  api: "#8b5cf6",      // violet
  store: "#f59e0b",    // amber
  lib: "#10b981",      // emerald
  data: "#6366f1",     // indigo
  external: "#ef4444", // red
};

const GROUP_COLORS: Record<string, string> = {
  // UI pages
  ui: "#3b82f6",
  // API groups
  pipeline: "#a855f7",
  kb: "#f59e0b",
  agents: "#10b981",
  projects: "#06b6d4",
  system: "#64748b",
  execution: "#ec4899",
  jira: "#3b82f6",
  costs: "#f97316",
  // Stores
  state: "#fbbf24",
  // Libs
  "pipeline-core": "#c084fc",
  quality: "#a78bfa",
  "kb-core": "#fbbf24",
  "agent-core": "#34d399",
  resources: "#fb923c",
  "system-core": "#94a3b8",
  context: "#22d3ee",
  // Data
  data: "#818cf8",
  // External
  external: "#f87171",
};

const LINK_COLORS: Record<string, string> = {
  calls: "#8b5cf6",
  reads: "#3b82f6",
  writes: "#ef4444",
  uses: "#10b981",
  feeds: "#f59e0b",
  proxies: "#ec4899",
};

const TYPE_LETTERS: Record<string, string> = {
  page: "P",
  api: "A",
  store: "S",
  lib: "L",
  data: "D",
  external: "X",
};

interface ArchGraphProps {
  nodes: ArchNode[];
  links: ArchLink[];
  filter: Set<string>;
  searchQuery: string;
  onNodeClick?: (node: ArchNode) => void;
}

export function ArchGraphView({ nodes, links, filter, searchQuery, onNodeClick }: ArchGraphProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<ArchNode | null>(null);

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

  // Configure forces ASAP (no reheat)
  const forcesApplied = useRef(false);
  useEffect(() => {
    if (forcesApplied.current) return;
    const timer = setInterval(() => {
      const fg = graphRef.current;
      if (!fg) return;
      fg.d3Force("charge")?.strength(-70).distanceMax(200);
      fg.d3Force("link")?.distance(30).strength(0.6);
      fg.d3Force("center")?.strength(0.15);
      forcesApplied.current = true;
      clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Filter — memoized to prevent hover re-renders from resetting the graph
  const graphData = useMemo(() => {
    const filteredNodes = nodes.filter((n) => {
      if (!filter.has(n.type)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.name.toLowerCase().includes(q) || n.group.toLowerCase().includes(q) || (n.description || "").toLowerCase().includes(q);
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
    const isExternal = node.type === "external";

    // Outer glow
    ctx.beginPath();
    if (isExternal) {
      // Diamond shape for externals
      ctx.moveTo(node.x, node.y - size - (isHovered ? 6 : 3));
      ctx.lineTo(node.x + size + (isHovered ? 6 : 3), node.y);
      ctx.lineTo(node.x, node.y + size + (isHovered ? 6 : 3));
      ctx.lineTo(node.x - size - (isHovered ? 6 : 3), node.y);
    } else {
      ctx.arc(node.x, node.y, size + (isHovered ? 6 : 3), 0, 2 * Math.PI);
    }
    ctx.closePath();
    ctx.fillStyle = isHovered ? `${nodeColor(node)}55` : `${nodeColor(node)}18`;
    ctx.fill();

    // Node shape
    ctx.beginPath();
    if (node.type === "data") {
      // Rounded rect for data
      const w = size * 1.6;
      const h = size * 1.2;
      const r = 3 / globalScale;
      ctx.moveTo(node.x - w / 2 + r, node.y - h / 2);
      ctx.lineTo(node.x + w / 2 - r, node.y - h / 2);
      ctx.quadraticCurveTo(node.x + w / 2, node.y - h / 2, node.x + w / 2, node.y - h / 2 + r);
      ctx.lineTo(node.x + w / 2, node.y + h / 2 - r);
      ctx.quadraticCurveTo(node.x + w / 2, node.y + h / 2, node.x + w / 2 - r, node.y + h / 2);
      ctx.lineTo(node.x - w / 2 + r, node.y + h / 2);
      ctx.quadraticCurveTo(node.x - w / 2, node.y + h / 2, node.x - w / 2, node.y + h / 2 - r);
      ctx.lineTo(node.x - w / 2, node.y - h / 2 + r);
      ctx.quadraticCurveTo(node.x - w / 2, node.y - h / 2, node.x - w / 2 + r, node.y - h / 2);
    } else if (isExternal) {
      ctx.moveTo(node.x, node.y - size);
      ctx.lineTo(node.x + size, node.y);
      ctx.lineTo(node.x, node.y + size);
      ctx.lineTo(node.x - size, node.y);
    } else if (node.type === "store") {
      // Hexagon for stores
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = node.x + size * Math.cos(angle);
        const y = node.y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    }
    ctx.closePath();
    ctx.fillStyle = nodeColor(node);
    ctx.fill();

    // Border
    ctx.strokeStyle = isHovered ? "#fff" : `${nodeColor(node)}cc`;
    ctx.lineWidth = isHovered ? 2.5 / globalScale : 1 / globalScale;
    ctx.stroke();

    // Letter
    const letter = TYPE_LETTERS[node.type] || "?";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${fontSize * 0.9}px monospace`;
    ctx.fillText(letter, node.x, node.y);

    // Label — always show
    ctx.fillStyle = isHovered ? "#f8fafc" : "#cbd5e1";
    ctx.font = `${fontSize * 0.7}px sans-serif`;
    ctx.fillText(node.name, node.x, node.y + size + fontSize * 0.8);
  }, [hoveredNode, nodeColor]);

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
        linkColor={(link: any) => LINK_COLORS[link.type] || "#334155"}
        linkWidth={(link: any) => link.type === "writes" || link.type === "feeds" ? 2.5 : link.type === "proxies" ? 2 : 1.5}
        linkLineDash={(link: any) => link.type === "feeds" ? [6, 3] : []}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={0.85}
        linkLabel={(link: any) => link.label || ""}
        linkCurvature={0}
        onNodeHover={(node: any) => setHoveredNode(node || null)}
        onNodeClick={(node: any) => onNodeClick?.(node)}
        onEngineStop={() => {
          graphData.nodes.forEach((n: any) => {
            n.fx = n.x;
            n.fy = n.y;
          });
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
            {hoveredNode.description && <div className="text-slate-300 mt-1">{hoveredNode.description}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
