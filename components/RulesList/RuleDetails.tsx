// components/RulesList/RuleDetails.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import WorkflowCanvas from '../WorkflowCanvas/WorkflowCanvas';
import { Rule } from '../../types';
import { getTriggerById } from '../../lib/triggers';
import { getActionById } from '../../lib/actions';

interface RuleDetailsProps {
  rule: Rule;
  onEdit: () => void;
}

const RuleDetails: React.FC<RuleDetailsProps> = ({ rule, onEdit }) => {
  const [showParameters, setShowParameters] = useState<boolean>(false);
  
  // Format parameter value for display
  const formatParameterValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };
  
  // Get trigger definition
  const triggerDef = getTriggerById(rule.triggerId);
  
  // Get action definition
  const actionDef = getActionById(rule.actionId);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-xl">{rule.name}</h4>
          {rule.description && (
            <p className="text-gray-600 mt-1">{rule.description}</p>
          )}
        </div>
        
        <button 
          onClick={onEdit}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Rule
        </button>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium text-gray-500">WORKFLOW VISUALIZATION</h5>
          <div className={`px-2 py-1 rounded-full text-xs ${
            rule.enabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
            }`}
          >
            {rule.enabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
        
        <div className="mt-4">
          <WorkflowCanvas rule={rule} />
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-sm font-medium text-gray-500">RULE DETAILS</h5>
          <button 
            onClick={() => setShowParameters(!showParameters)}
            className="text-blue-600 text-xs flex items-center"
          >
            {showParameters ? 'Hide Parameters' : 'Show Parameters'}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transform ${showParameters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Trigger</div>
            <div className="font-medium">
              {triggerDef?.name || rule.triggerId.replace(/_/g, ' ')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Action</div>
            <div className="font-medium">
              {actionDef?.name || rule.actionId.replace(/_/g, ' ')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Schedule</div>
            <div className="font-medium">
              {rule.schedule === 'immediate' 
                ? 'Execute immediately' 
                : `Execute after ${rule.delay} minutes`}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Created</div>
            <div className="font-medium">
              {new Date(rule.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Parameters section (shown when expanded) */}
        {showParameters && (
          <div className="mt-4 space-y-4">
            {/* Trigger Parameters */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h6 className="text-xs font-medium text-gray-500 mb-2">TRIGGER PARAMETERS</h6>
              {triggerDef?.parameters && rule.triggerParams ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {triggerDef.parameters.map(param => (
                    <div key={param.name}>
                      <div className="text-xs text-gray-500">{param.name}</div>
                      <div className="text-sm">
                        {formatParameterValue(rule.triggerParams[param.name])}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No parameters defined</div>
              )}
            </div>
            
            {/* Action Parameters */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h6 className="text-xs font-medium text-gray-500 mb-2">ACTION PARAMETERS</h6>
              {actionDef?.parameters && rule.actionParams ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {actionDef.parameters.map(param => (
                    <div key={param.name}>
                      <div className="text-xs text-gray-500">{param.name}</div>
                      <div className="text-sm">
                        {formatParameterValue(rule.actionParams[param.name])}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No parameters defined</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleDetails;