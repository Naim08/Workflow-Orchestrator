// components/RuleBuilder/ActionSelector.tsx
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
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
  const handleActionSelect = (actionId: string) => {
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
  
  // Get unique categories
  const categories = ['all', ...new Set(actions.map(action => action.category))];
  
  // Filter actions based on search and category
  const filteredActions = actions.filter(action => {
    const matchesSearch = 
      action.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      action.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group actions by category for display
  const actionsByCategory: Record<string, Action[]> = {};
  
  if (selectedCategory === 'all') {
    // Group by category when showing all
    filteredActions.forEach(action => {
      if (!actionsByCategory[action.category]) {
        actionsByCategory[action.category] = [];
      }
      actionsByCategory[action.category].push(action);
    });
  } else {
    // Just use the selected category
    actionsByCategory[selectedCategory] = filteredActions;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Select Action *</label>
        
        {/* Search and filter */}
        <div className="flex space-x-2 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="w-1/3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Action selection boxes */}
        {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
              {category}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryActions.map(action => (
                <div
                  key={action.id}
                  onClick={() => handleActionSelect(action.id)}
                  className={`
                    p-3 rounded border cursor-pointer transition-all
                    ${selectedActionId === action.id 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}
                  `}
                >
                  <h4 className="font-medium text-sm">{action.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-gray-500 border rounded bg-gray-50">
            No actions found matching your search.
          </div>
        )}
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