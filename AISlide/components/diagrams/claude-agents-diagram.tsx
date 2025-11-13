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
    data: { label: '🤖 Main Agent\nCLAUDE.md' },
    position: { x: 250, y: 0 },
    style: {
      background: '#dbeafe',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      padding: '16px',
      fontWeight: '600',
      fontSize: '13px',
      textAlign: 'center',
      minWidth: '150px',
    },
  },
  {
    id: '2',
    data: { label: '🧪 nextjs-qa-tester' },
    position: { x: 50, y: 150 },
    style: {
      background: '#dcfce7',
      border: '2px solid #22c55e',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '12px',
      minWidth: '140px',
    },
  },
  {
    id: '3',
    data: { label: '🎨 ui-ux-guru' },
    position: { x: 220, y: 150 },
    style: {
      background: '#fae8ff',
      border: '2px solid #a855f7',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '12px',
      minWidth: '140px',
    },
  },
  {
    id: '4',
    data: { label: '🖼️ design-asset-generator' },
    position: { x: 390, y: 150 },
    style: {
      background: '#dbeafe',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '12px',
      minWidth: '140px',
    },
  },
  {
    id: '5',
    data: { label: '💼 workspace-agent' },
    position: { x: 135, y: 280 },
    style: {
      background: '#fed7aa',
      border: '2px solid #f97316',
      borderRadius: '8px',
      padding: '12px',
      fontWeight: '500',
      fontSize: '12px',
      minWidth: '140px',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'QA Testing',
    style: { stroke: '#22c55e', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    label: 'UI/UX Design',
    style: { stroke: '#a855f7', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'e1-4',
    source: '1',
    target: '4',
    label: 'Asset Gen',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    label: 'Workspace Mgmt',
    style: { stroke: '#f97316', strokeWidth: 2 },
  },
];

export function ClaudeAgentsDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '400px' }} className="border border-slate-300 rounded-lg bg-slate-50">
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
