import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TriggerNode from './TriggerNode';
import ActionNode from './ActionNode';
import { Rule } from '../../types';

// Define custom node data types
export interface TriggerNodeData {
  label: string;
  params: Record<string, any>;
}

export interface ActionNodeData {
  label: string;
  params: Record<string, any>;
  schedule: 'immediate' | 'delayed';
  delay: number;
}

// Custom node types
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

interface WorkflowCanvasProps {
  rule: Rule | null;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ rule }) => {
  // Generate initial nodes and edges based on the rule
  const initialNodes: Node[] = rule ? [
    {
      id: 'trigger',
      type: 'trigger',
      data: { 
        label: rule.triggerId.replace(/_/g, ' '), 
        params: rule.triggerParams 
      } as TriggerNodeData,
      position: { x: 250, y: 100 },
    },
    {
      id: 'action',
      type: 'action',
      data: { 
        label: rule.actionId.replace(/_/g, ' '), 
        params: rule.actionParams,
        schedule: rule.schedule,
        delay: rule.delay,
      } as ActionNodeData,
      position: { x: 350, y: 450 },
    },
  ] : [];

  const initialEdges: Edge[] = rule ? [
    {
      id: 'trigger-to-action',
      source: 'trigger',
      target: 'action',
      type: 'smoothstep',
      animated: true,
      label: rule.schedule === 'immediate' ? 'Immediate' : `After ${rule.delay} minutes`,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    },
  ] : [];

  // Set up the React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Empty state when no rule is provided
  if (!rule) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Select a rule to visualize its workflow</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full border border-gray-200 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background color="#f8fafc" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;