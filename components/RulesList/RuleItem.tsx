import React, { useState } from 'react';
import { Rule } from '../../types';
import { useRouter } from 'next/router';


interface RuleItemProps {
  rule: Rule;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}

const RuleItem: React.FC<RuleItemProps> = ({ rule, isSelected, onSelect, onDelete, onToggle }) => {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onToggle(!rule.enabled);
  };
  
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setConfirmDelete(true);
  };
  
  const handleConfirmDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onDelete();
    setConfirmDelete(false);
  };
  
  const handleCancelDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setConfirmDelete(false);
  };
  
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    router.push(`/edit/${rule.id}`);
  };
  
  return (
    <div
      onClick={onSelect}
      className={`relative p-3 rounded-md border cursor-pointer transition-colors ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      {confirmDelete ? (
        <div className="p-2 bg-red-50 rounded-md border border-red-200 space-y-2">
          <p className="text-sm text-red-700">Are you sure you want to delete this rule?</p>
          <div className="flex justify-between">
            <button
              onClick={handleCancelDelete}
              className="px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div className="mr-8">
              <h4 className="font-medium text-gray-900 truncate">{rule.name}</h4>
              {rule.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">{rule.description}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleToggle}
                className={`relative mr-2 inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              
              <button
                onClick={handleEditClick}
                className="text-gray-400 hover:text-blue-500 mr-2"
                title="Edit rule"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="text-gray-400 hover:text-red-500"
                title="Delete rule"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Trigger:</span> {rule.triggerId.replace(/_/g, ' ')}
            </div>
            <div>
              <span className="text-gray-500">Action:</span> {rule.actionId.replace(/_/g, ' ')}
            </div>
          </div>
          
          <div className="mt-2 text-xs">
            <span className="text-gray-500">Schedule:</span>{' '}
            {rule.schedule === 'immediate' 
              ? 'Immediate' 
              : `After ${rule.delay} min`}
          </div>
        </>
      )}
    </div>
  );
};

export default RuleItem;