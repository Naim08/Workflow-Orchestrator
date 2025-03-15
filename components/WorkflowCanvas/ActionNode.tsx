import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ActionNodeData } from './WorkflowCanvas';

const ActionNode: React.FC<NodeProps<ActionNodeData>> = ({ data }) => {
  return (
    <div className="rounded-lg border border-green-500 bg-green-50 p-4 shadow-md text-center min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="bg-green-600 w-3 h-3"
      />
      
      <div className="font-bold text-green-800 mb-2">ACTION</div>
      <div className="text-green-900">{data.label}</div>
      
      {data.schedule && (
        <div className="mt-2 bg-white bg-opacity-50 rounded px-2 py-1 text-xs text-green-800">
          {data.schedule === 'immediate' 
            ? 'Execute immediately' 
            : `Execute after ${data.delay} minutes`}
        </div>
      )}
      
      {data.params && Object.keys(data.params).length > 0 && (
        <div className="mt-2 pt-2 border-t border-green-200 text-xs text-left text-green-700">
          <div className="font-semibold mb-1">Parameters:</div>
          {Object.entries(data.params).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span>{key}:</span>
              <span className="font-mono">{String(value).substring(0, 15)}{String(value).length > 15 ? '...' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionNode;