import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RuleItem from './RuleItem';
import WorkflowCanvas from '../WorkflowCanvas/WorkflowCanvas';
import { Rule } from '../../types';

const RulesList: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  // Fetch rules from the API
  useEffect(() => {
    const fetchRules = async (): Promise<void> => {
      try {
        const response = await axios.get<{ data: Rule[] }>('/api/rules');
        
        // Check if response.data has a data property (common Supabase pattern)
        if (response.data && Array.isArray(response.data.data)) {
          setRules(response.data.data);
        } else if (Array.isArray(response.data)) {
          // If response.data is directly the array
          setRules(response.data);
        } else {
          // Handle unexpected data structure
          console.error('Unexpected data structure:', response.data);
          setRules([]);
        }
        
        // Select the first rule by default if available
        if (rules.length > 0) {
          setSelectedRule(rules[0]);
        }
      } catch (err) {
        setError('Failed to fetch rules');
        console.error(err);
        // Make sure rules is an empty array in case of error
        setRules([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRules();
  }, []);

  // Handle rule selection for details view
  const handleSelectRule = (rule: Rule): void => {
    setSelectedRule(rule);
  };

  // Handle rule deletion
  const handleDeleteRule = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/rules/${id}`);
      setRules(rules.filter(rule => rule.id !== id));
      if (selectedRule && selectedRule.id === id) {
        setSelectedRule(rules.length > 1 ? rules.find(r => r.id !== id) || null : null);
      }
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  // Handle rule toggle (enable/disable)
  const handleToggleRule = async (id: string, isEnabled: boolean): Promise<void> => {
    try {
      await axios.put(`/api/rules/${id}`, { enabled: isEnabled });
      setRules(rules.map(rule => rule.id === id ? { ...rule, enabled: isEnabled } : rule));
      if (selectedRule && selectedRule.id === id) {
        setSelectedRule({ ...selectedRule, enabled: isEnabled });
      }
    } catch (err) {
      console.error('Failed to update rule:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading rules...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Automation Rules</h2>
        <a href="/create" className="btn btn-primary">
          + Create New Rule
        </a>
      </div>

      {rules.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any automation rules yet.</p>
          <a href="/create" className="btn btn-primary">
            Create Your First Rule
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Rules</h3>
             
                {Array.isArray(rules) && rules.length > 0 ? (
                    <div className="space-y-3">
                        {rules.map(rule => (
                            <RuleItem
                                key={rule.id}
                                rule={rule}
                                isSelected={selectedRule ? selectedRule.id === rule.id : false}
                                onSelect={() => handleSelectRule(rule)}
                                onDelete={() => handleDeleteRule(rule.id)}
                                onToggle={(enabled) => handleToggleRule(rule.id, enabled)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-gray-500 text-center">
                        {loading ? "Loading rules..." : "No rules found"}
                    </div>
                )}

            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Rule Details</h3>
              
              {selectedRule ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-xl">{selectedRule.name}</h4>
                    {selectedRule.description && (
                      <p className="text-gray-600 mt-1">{selectedRule.description}</p>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-500">WORKFLOW VISUALIZATION</h5>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        selectedRule.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedRule.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <WorkflowCanvas rule={selectedRule} />
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">RULE DETAILS</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Trigger</div>
                        <div className="font-medium">
                          {selectedRule.triggerId.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Action</div>
                        <div className="font-medium">
                          {selectedRule.actionId.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Schedule</div>
                        <div className="font-medium">
                          {selectedRule.schedule === 'immediate' 
                            ? 'Execute immediately' 
                            : `Execute after ${selectedRule.delay} minutes`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Created</div>
                        <div className="font-medium">
                          {new Date(selectedRule.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a rule to view details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesList;