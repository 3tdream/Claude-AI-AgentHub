'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Network, GitBranch, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🌐 Client Application' },
    position: { x: 250, y: 0 },
    style: {
      background: '#f1f5f9',
      border: '2px solid #cbd5e1',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
  {
    id: '2',
    data: { label: '⚡ Load Balancer' },
    position: { x: 250, y: 100 },
    style: {
      background: '#fef3c7',
      border: '2px solid #fbbf24',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
  {
    id: '3',
    data: { label: '🚪 API Gateway' },
    position: { x: 250, y: 200 },
    style: {
      background: '#e0f2fe',
      border: '2px solid #38bdf8',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
  {
    id: '4',
    data: { label: '🔐 Auth Service' },
    position: { x: 100, y: 320 },
    style: {
      background: '#ddd6fe',
      border: '2px solid #a78bfa',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
  {
    id: '5',
    data: { label: '👤 User Service' },
    position: { x: 250, y: 320 },
    style: {
      background: '#ddd6fe',
      border: '2px solid #a78bfa',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
  {
    id: '6',
    data: { label: '📦 Product Service' },
    position: { x: 400, y: 320 },
    style: {
      background: '#ddd6fe',
      border: '2px solid #a78bfa',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
  {
    id: '7',
    type: 'output',
    data: { label: '💾 Database Cluster' },
    position: { x: 175, y: 450 },
    style: {
      background: '#fee2e2',
      border: '2px solid #f87171',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
  {
    id: '8',
    type: 'output',
    data: { label: '⚡ Redis Cache' },
    position: { x: 350, y: 450 },
    style: {
      background: '#fee2e2',
      border: '2px solid #f87171',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'HTTPS', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e3-6', source: '3', target: '6', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e4-7', source: '4', target: '7', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e5-7', source: '5', target: '7', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e6-7', source: '6', target: '7', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e3-8', source: '3', target: '8', label: 'Cache', style: { stroke: '#64748b', strokeWidth: 2 } },
];

export default function DiagramsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dev-portal/docs">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Docs
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8" />
              <h1 className="text-3xl font-light">Interactive System Architecture</h1>
            </div>
          </div>
          <p className="text-slate-600 ml-[60px]">
            Drag nodes to rearrange, zoom and pan to explore the architecture
          </p>
          <div className="flex gap-2 mt-4 ml-[60px]">
            <Badge variant="secondary" className="gap-1">
              <GitBranch className="w-3 h-3" />
              React Flow
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Interactive
            </Badge>
          </div>
        </div>
      </header>

      {/* Diagram Container */}
      <div className="w-full" style={{ height: 'calc(100vh - 232px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const style = node.style as any;
              return style?.background || '#f1f5f9';
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      {/* Instructions */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Drag nodes to rearrange</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Scroll to zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Click + drag background to pan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
