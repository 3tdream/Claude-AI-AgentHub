'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🌐 Browser Interface' },
    position: { x: 250, y: 0 },
    style: {
      background: '#e0f2fe',
      border: '2px solid #38bdf8',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '13px',
    },
  },
  {
    id: '2',
    data: { label: '📱 Next.js Frontend' },
    position: { x: 250, y: 100 },
    style: {
      background: '#ddd6fe',
      border: '2px solid #a78bfa',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '13px',
    },
  },
  {
    id: '3',
    data: { label: '⚡ Zustand Store' },
    position: { x: 100, y: 220 },
    style: {
      background: '#fef3c7',
      border: '2px solid #fbbf24',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '13px',
      width: 140,
    },
  },
  {
    id: '4',
    data: { label: '🔌 API Routes' },
    position: { x: 300, y: 220 },
    style: {
      background: '#fef3c7',
      border: '2px solid #fbbf24',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '13px',
      width: 140,
    },
  },
  {
    id: '5',
    data: { label: '🎙️ OpenAI Realtime API' },
    position: { x: 225, y: 340 },
    style: {
      background: '#fee2e2',
      border: '2px solid #f87171',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '13px',
      width: 180,
    },
  },
  {
    id: '6',
    data: { label: '🎤 Voice Input' },
    position: { x: 25, y: 100 },
    style: {
      background: '#e0f2fe',
      border: '2px solid #38bdf8',
      borderRadius: '8px',
      padding: '10px',
      fontWeight: '500',
      fontSize: '12px',
      width: 120,
    },
  },
  {
    id: '7',
    data: { label: '⌨️ Text Input' },
    position: { x: 425, y: 100 },
    style: {
      background: '#e0f2fe',
      border: '2px solid #38bdf8',
      borderRadius: '8px',
      padding: '10px',
      fontWeight: '500',
      fontSize: '12px',
      width: 120,
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e6-1', source: '6', target: '1', style: { stroke: '#64748b', strokeWidth: 1.5 } },
  { id: 'e7-1', source: '7', target: '1', style: { stroke: '#64748b', strokeWidth: 1.5 } },
  { id: 'e2-3', source: '2', target: '3', label: 'State', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', label: 'API', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, label: 'WebRTC', style: { stroke: '#64748b', strokeWidth: 2 } },
  { id: 'e5-3', source: '5', target: '3', label: 'Updates', style: { stroke: '#64748b', strokeWidth: 2 }, animated: true },
];

export function SystemArchitectureDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '450px' }} className="border border-slate-300 rounded-lg bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
