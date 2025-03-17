// components/RuleBuilder/TriggerSelector.tsx
import React, { useState, useEffect } from 'react';
import { getAllTriggers, getTriggerById } from '../../lib/triggers';
import { Trigger } from '../../types';

interface TriggerSelectorProps {
  selectedTriggerId: string;
  onSelectTrigger: (triggerId: string) => void;
  parameters: Record<string, any>;
  onParametersChange: (parameters: Record<string, any>) => void;
}

const TriggerSelector: React.FC<TriggerSelectorProps> = ({
  selectedTriggerId,
  onSelectTrigger,
  parameters,
  onParametersChange
}) => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  
  // Load all available triggers
  useEffect(() => {
    const allTriggers = getAllTriggers();
    setTriggers(allTriggers);
  }, []);
  
  // Update selectedTrigger when selectedTriggerId changes
  useEffect(() => {
    if (selectedTriggerId) {
      const trigger = getTriggerById(selectedTriggerId);
      setSelectedTrigger(trigger || null);
      
      // Initialize parameters for the newly selected trigger
      if (trigger) {
        // Create default parameters if they don't exist or if switching to a different trigger
        const initialParams: Record<string, any> = {};
        
        trigger.parameters.forEach(param => {
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
      setSelectedTrigger(null);
    }
  }, [selectedTriggerId]);
  
  // Handle trigger selection
  const handleTriggerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const triggerId = e.target.value;
    onSelectTrigger(triggerId);
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
  
  // Group triggers by category
  const triggersByCategory: Record<string, Trigger[]> = {};
  triggers.forEach(trigger => {
    if (!triggersByCategory[trigger.category]) {
      triggersByCategory[trigger.category] = [];
    }
    triggersByCategory[trigger.category].push(trigger);
  });
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Trigger *</label>
        <select
          value={selectedTriggerId}
          onChange={handleTriggerSelect}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="" disabled>Select a trigger</option>
          {Object.entries(triggersByCategory).map(([category, categoryTriggers]) => (
            <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
              {categoryTriggers.map(trigger => (
                <option key={trigger.id} value={trigger.id}>
                  {trigger.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      
      {selectedTrigger && selectedTrigger.parameters.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Configure Parameters</label>
          <div className="space-y-3 p-3 border rounded bg-gray-50">
            {selectedTrigger.parameters.map(param => (
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
      
      {selectedTrigger && (
        <div className="p-3 border rounded bg-blue-50 text-blue-800">
          <h4 className="font-medium mb-1">{selectedTrigger.name}</h4>
          <p className="text-sm">{selectedTrigger.description}</p>
          {selectedTrigger.id === 'scheduled_time' && (
            <div className="mt-2 text-xs bg-yellow-100 p-2 rounded">
              <strong>Note:</strong> This trigger uses real-time scheduling. The rule will execute at the specified time.
            </div>
          )}
          {selectedTrigger.id.includes('webhook') && (
            <div className="mt-2 text-xs bg-yellow-100 p-2 rounded">
              <strong>Note:</strong> This trigger is based on incoming webhook events. Make sure your webhook endpoint is properly configured.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TriggerSelector;