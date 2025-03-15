import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TriggerNodeData } from './WorkflowCanvas';

const TriggerNode: React.FC<NodeProps<TriggerNodeData>> = ({ data }) => {
  return (
    <div className="rounded-lg border border-blue-500 bg-blue-50 p-4 shadow-md text-center min-w-[200px]">
      <div className="font-bold text-blue-800 mb-2">TRIGGER</div>
      <div className="text-blue-900">{data.label}</div>
      
      {data.params && Object.keys(data.params).length > 0 && (
        <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-left text-blue-700">
          <div className="font-semibold mb-1">Parameters:</div>
          {Object.entries(data.params).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span>{key}:</span>
              <span className="font-mono">{String(value).substring(0, 15)}{String(value).length > 15 ? '...' : ''}</span>
            </div>
          ))}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="bg-blue-600 w-3 h-3"
      />
    </div>
  );
};

export default TriggerNode;