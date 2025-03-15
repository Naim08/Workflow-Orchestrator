import React, { useState, ChangeEvent, FormEvent } from 'react';
import { getAllActions, getActionsByCategory } from '../../lib/actions';
import { Action } from '../../types';

interface ActionSelectorProps {
  onSelect: (actionId: string, params?: Record<string, any>) => void;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({ onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionParams, setActionParams] = useState<Record<string, any>>({});
  const allActions = getAllActions();
  
  // Get unique categories from all actions
  const categories: string[] = ['all', ...Array.from(new Set(allActions.map(action => action.category)))];
  
  // Filter actions by selected category
  const filteredActions: Action[] = selectedCategory === 'all' 
    ? allActions 
    : getActionsByCategory(selectedCategory);
  
  // Handle action selection
  const handleActionClick = (action: Action): void => {
    setSelectedAction(action);
    
    // Initialize parameters with default values
    const initialParams: Record<string, any> = {};
    action.parameters.forEach(param => {
      if (param.default !== undefined) {
        initialParams[param.name] = param.default;
      } else if (param.type === 'boolean') {
        initialParams[param.name] = false;
      } else {
        initialParams[param.name] = '';
      }
    });
    
    setActionParams(initialParams);
  };
  
  // Handle parameter input change
  const handleParamChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    setActionParams(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (selectedAction) {
      onSelect(selectedAction.id, actionParams);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Step 2: Choose an Action</h2>
      <p className="text-gray-600 mb-6">
        Select what should happen when the trigger event occurs.
      </p>
      
      {!selectedAction ? (
        <>
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActions.map(action => (
              <div
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <h3 className="font-medium text-lg mb-1">{action.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{action.description}</p>
                <div className="text-xs text-gray-500">
                  Category: {action.category}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">{selectedAction.name}</h3>
            <p className="text-gray-600 mb-4">{selectedAction.description}</p>
            
            <div className="space-y-4">
              {selectedAction.parameters.map(param => (
                <div key={param.name}>
                  <label htmlFor={param.name} className="label">
                    {param.description}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {param.type === 'text' ? (
                    <textarea
                      id={param.name}
                      name={param.name}
                      value={actionParams[param.name] || ''}
                      onChange={handleParamChange}
                      className="input h-24"
                      placeholder={`Enter ${param.description.toLowerCase()}`}
                      required={param.required}
                    />
                  ) : param.type === 'boolean' ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={param.name}
                        name={param.name}
                        checked={actionParams[param.name] || false}
                        onChange={handleParamChange as any}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={param.name} className="ml-2 block text-sm text-gray-900">
                        {param.description}
                      </label>
                    </div>
                  ) : (
                    <input
                      type={param.type === 'date' || param.type === 'datetime' ? 'datetime-local' : 'text'}
                      id={param.name}
                      name={param.name}
                      value={actionParams[param.name] || ''}
                      onChange={handleParamChange}
                      className="input"
                      placeholder={`Enter ${param.description.toLowerCase()}`}
                      required={param.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setSelectedAction(null)}
              className="btn btn-outline"
            >
              Back to Action List
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
            >
              Continue
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ActionSelector;