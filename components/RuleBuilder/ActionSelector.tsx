import React, { useState, useEffect } from 'react';
import { getAllActions, getActionById } from '../../lib/actions';
import { Action } from '../../types';

interface ActionSelectorProps {
  selectedActionId: string;
  onSelectAction: (actionId: string) => void;
  parameters: Record<string, any>;
  onParametersChange: (parameters: Record<string, any>) => void;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({
  selectedActionId,
  onSelectAction,
  parameters,
  onParametersChange
}) => {
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  
  // Load all available actions
  useEffect(() => {
    const allActions = getAllActions();
    setActions(allActions);
  }, []);
  
  // Update selectedAction when selectedActionId changes
  useEffect(() => {
    if (selectedActionId) {
      const action = getActionById(selectedActionId);
      setSelectedAction(action || null);
      
      // Initialize parameters for the newly selected action
      if (action) {
        // Create default parameters if they don't exist or if switching to a different action
        const initialParams: Record<string, any> = {};
        
        action.parameters.forEach(param => {
          // Use existing parameter value if it exists, otherwise use default
          if (parameters && parameters[param.name] !== undefined) {
            initialParams[param.name] = parameters[param.name];
          } else {
            initialParams[param.name] = param.default !== undefined ? param.default : '';
          }
        });
        
        // Only update parameters if they're different
        if (JSON.stringify(initialParams) !== JSON.stringify(parameters)) {
          onParametersChange(initialParams);
        }
      }
    } else {
      setSelectedAction(null);
    }
  }, [selectedActionId]);
  
  // Handle action selection
  const handleActionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const actionId = e.target.value;
    onSelectAction(actionId);
  };
  
  // Handle parameter change
  const handleParameterChange = (paramName: string, value: any) => {
    onParametersChange({
      ...parameters,
      [paramName]: value
    });
  };
  
  // Render the appropriate input field based on parameter type
  const renderParameterInput = (param: any) => {
    const value = parameters[param.name];
    
    switch (param.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder={param.description}
            required={param.required}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value !== undefined ? value : ''}
            onChange={(e) => handleParameterChange(param.name, e.target.valueAsNumber)}
            className="w-full border rounded px-3 py-2"
            placeholder={param.description}
            required={param.required}
          />
        );
        
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleParameterChange(param.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              id={`param-${param.name}`}
            />
            <label
              htmlFor={`param-${param.name}`}
              className="ml-2 block text-sm text-gray-700"
            >
              {param.description}
            </label>
          </div>
        );
        
      case 'enum':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full border rounded px-3 py-2"
            required={param.required}
          >
            <option value="" disabled>Select an option</option>
            {param.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder={param.description}
            rows={4}
            required={param.required}
          />
        );
  
      case 'json':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : (value || '')}
            onChange={(e) => {
              try {
                // Try to parse as JSON
                const jsonValue = JSON.parse(e.target.value);
                handleParameterChange(param.name, jsonValue);
              } catch {
                // If not valid JSON, store as string
                handleParameterChange(param.name, e.target.value);
              }
            }}
            className="w-full border rounded px-3 py-2 font-mono"
            placeholder={param.description}
            rows={4}
            required={param.required}
          />
        );
        
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full border rounded px-3 py-2"
            required={param.required}
          />
        );
        
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder={param.description}
            required={param.required}
          />
        );
    }
  };
  
  // Group actions by category
  const actionsByCategory: Record<string, Action[]> = {};
  actions.forEach(action => {
    if (!actionsByCategory[action.category]) {
      actionsByCategory[action.category] = [];
    }
    actionsByCategory[action.category].push(action);
  });
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Action *</label>
        <select
          value={selectedActionId}
          onChange={handleActionSelect}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="" disabled>Select an action</option>
          {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
            <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
              {categoryActions.map(action => (
                <option key={action.id} value={action.id}>
                  {action.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      
      {selectedAction && selectedAction.parameters.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Configure Parameters</label>
          <div className="space-y-3 p-3 border rounded bg-gray-50">
            {selectedAction.parameters.map(param => (
              <div key={param.name}>
                <label className="block text-sm mb-1">
                  {param.name}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderParameterInput(param)}
                {param.description && !param.type?.includes('boolean') && (
                  <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedAction && (
        <div className="p-3 border rounded bg-blue-50 text-blue-800">
          <h4 className="font-medium mb-1">{selectedAction.name}</h4>
          <p className="text-sm">{selectedAction.description}</p>
        </div>
      )}
    </div>
  );
};

export default ActionSelector;