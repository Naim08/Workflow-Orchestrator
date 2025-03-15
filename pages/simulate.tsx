import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import { getAllTriggers } from '../lib/triggers';
import { Trigger, TriggerSimulationResponse, Rule } from '../types';

const Simulate: NextPage = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [selectedTriggerId, setSelectedTriggerId] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TriggerSimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available triggers
  useEffect(() => {
    const availableTriggers = getAllTriggers();
    setTriggers(availableTriggers);
    
    if (availableTriggers.length > 0) {
      setSelectedTriggerId(availableTriggers[0].id);
      
      // Initialize parameters for the first trigger
      const initialParams: Record<string, any> = {};
      availableTriggers[0].parameters.forEach(param => {
        initialParams[param.name] = '';
      });
      
      setParameters(initialParams);
    }
  }, []);

  // Handle trigger selection change
  const handleTriggerChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const triggerId = e.target.value;
    setSelectedTriggerId(triggerId);
    
    // Reset parameters for the newly selected trigger
    const trigger = triggers.find(t => t.id === triggerId);
    if (trigger) {
      const newParams: Record<string, any> = {};
      trigger.parameters.forEach(param => {
        newParams[param.name] = '';
      });
      
      setParameters(newParams);
    }
  };

  // Handle parameter input change
  const handleParamChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!selectedTriggerId) {
      setError('Please select a trigger');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post<TriggerSimulationResponse>('/api/rules/trigger', {
        triggerId: selectedTriggerId,
        parameters
      });
      
      setResult(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to simulate trigger');
      } else {
        setError('An unexpected error occurred');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get the currently selected trigger
  const selectedTrigger = triggers.find(t => t.id === selectedTriggerId);

  return (
    <Layout title="Simulate">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simulate Triggers</h1>
        
        <div className="card mb-6">
          <h2 className="text-lg font-medium mb-4">Run a Test Trigger</h2>
          <p className="text-gray-600 mb-6">
            Simulate a trigger event to test your automation rules. This will execute any matching rules.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="triggerId" className="label">Select Trigger</label>
              <select
                id="triggerId"
                value={selectedTriggerId}
                onChange={handleTriggerChange}
                className="select"
              >
                {triggers.map(trigger => (
                  <option key={trigger.id} value={trigger.id}>
                    {trigger.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTrigger && selectedTrigger.parameters.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Parameters</h3>
                <div className="space-y-3">
                  {selectedTrigger.parameters.map(param => (
                    <div key={param.name}>
                      <label htmlFor={param.name} className="label">
                        {param.description}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        id={param.name}
                        name={param.name}
                        value={parameters[param.name] || ''}
                        onChange={handleParamChange}
                        className="input"
                        placeholder={`Enter ${param.name}`}
                        required={param.required}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200 text-red-700">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>
          </form>
        </div>
        
        {result && (
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Simulation Results</h2>
            
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Trigger: {selectedTriggerId.replace(/_/g, ' ')}
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">Rules executed:</span> {result.rulesMatched}
              </div>
            </div>
            
            {result.executedRules && result.executedRules.length > 0 ? (
              <div className="space-y-3">
                {result.executedRules.map((rule, index) => (
                  <div key={index} className="p-3 rounded-md border border-green-200 bg-green-50">
                    <div className="font-medium text-green-800 mb-1">
                      {rule.name}
                    </div>
                    <div className="text-sm text-green-700">
                      Action: {rule.actionId.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {rule.schedule === 'immediate' 
                        ? 'Executed immediately' 
                        : `Scheduled to execute after ${rule.delay} minutes`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No rules matched this trigger
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Simulate;