import React, { useState } from 'react';
import { getAllTriggers, getTriggersByCategory } from '../../lib/triggers';
import { Trigger } from '../../types';

interface TriggerSelectorProps {
  onSelect: (triggerId: string, params?: Record<string, any>) => void;
}

const TriggerSelector: React.FC<TriggerSelectorProps> = ({ onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const allTriggers = getAllTriggers();
  
  // Get unique categories from all triggers
  const categories: string[] = ['all', ...Array.from(new Set(allTriggers.map(trigger => trigger.category)))];
  
  // Filter triggers by selected category
  const filteredTriggers: Trigger[] = selectedCategory === 'all' 
    ? allTriggers 
    : getTriggersByCategory(selectedCategory);
  
  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Step 1: Choose a Trigger</h2>
      <p className="text-gray-600 mb-6">
        Select what event will start your automation workflow.
      </p>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTriggers.map(trigger => (
          <div
            key={trigger.id}
            onClick={() => onSelect(trigger.id)}
            className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <h3 className="font-medium text-lg mb-1">{trigger.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{trigger.description}</p>
            <div className="text-xs text-gray-500">
              Category: {trigger.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TriggerSelector;