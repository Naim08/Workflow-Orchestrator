import React, { useState } from 'react';
import { format } from 'date-fns';
import { Log } from '../../types';

interface LogItemProps {
  log: Log;
}

const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  
  const toggleExpand = (): void => {
    setExpanded(!expanded);
  };
  
  // Determine the log type indicator styling
  const getTypeStyle = (): string => {
    switch (log.type) {
      case 'trigger':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'action':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Format the timestamp
  const formattedTime = format(new Date(log.timestamp), 'HH:mm:ss');
  
  return (
    <div 
      className={`p-3 rounded-md border ${expanded ? 'border-gray-300 bg-gray-50' : 'border-gray-200'} hover:bg-gray-50 transition-colors`}
      onClick={toggleExpand}
    >
      <div className="flex items-start justify-between cursor-pointer">
        <div className="flex items-start space-x-3">
          <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeStyle()}`}>
            {log.type.toUpperCase()}
          </div>
          
          <div>
            <div className="font-medium">
              {log.message}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {log.ruleName} • {formattedTime}
            </div>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {expanded && log.details && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm">
            <div className="font-medium mb-1">Details</div>
            <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {typeof log.details === 'object' 
                ? JSON.stringify(log.details, null, 2) 
                : log.details}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogItem;