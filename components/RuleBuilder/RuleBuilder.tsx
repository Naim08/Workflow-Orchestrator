import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import TriggerSelector from './TriggerSelector';
import ActionSelector from './ActionSelector';
import ScheduleSelector from './ScheduleSelector';
import { Rule, RuleCondition, ParseNaturalLanguageResponse } from '../../types';

type RuleFormState = Omit<Rule, 'id' | 'enabled' | 'createdAt' | 'updatedAt'> & {
  conditions?: RuleCondition[];
};

const RuleBuilder: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [parsingResult, setParsingResult] = useState<ParseNaturalLanguageResponse | null>(null);
  const [rule, setRule] = useState<RuleFormState>({
    name: '',
    description: '',
    triggerId: '',
    triggerParams: {},
    actionId: '',
    actionParams: {},
    schedule: 'immediate',
    delay: 60, // Default delay in minutes
    conditions: []
  });

  // Handle natural language parsing with LangChain
  const handleParseNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) {
      setError('Please enter a description of the rule');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the advanced parsing endpoint powered by LangChain
      const response = await axios.post<ParseNaturalLanguageResponse>('/api/openai/advanced-parse', {
        text: naturalLanguageInput
      });

      const result = response.data;
      setParsingResult(result);

      // Update the rule with the parsed data
      setRule(prevRule => ({
        ...prevRule,
        name: result.description || `Rule from "${naturalLanguageInput.substring(0, 30)}${naturalLanguageInput.length > 30 ? '...' : ''}"`,
        description: result.description || '',
        triggerId: result.triggerId,
        actionId: result.actionId,
        schedule: result.schedule,
        delay: result.delay || 60,
        conditions: result.conditions || []
      }));

      // Move to the appropriate step for confirmation
      setStep(4);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to parse natural language input');
        console.error('Error details:', err.response?.data?.details || err.message);
      } else {
        setError('An unexpected error occurred');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRule(prevRule => ({
      ...prevRule,
      [name]: value
    }));
  };

  // Handle trigger selection
  const handleTriggerSelect = (triggerId: string, params: Record<string, any> = {}) => {
    setRule(prevRule => ({
      ...prevRule,
      triggerId,
      triggerParams: params
    }));
    setStep(2);
  };

  // Handle action selection
  const handleActionSelect = (actionId: string, params: Record<string, any> = {}) => {
    setRule(prevRule => ({
      ...prevRule,
      actionId,
      actionParams: params
    }));
    setStep(3);
  };

  // Handle schedule selection
  const handleScheduleSelect = (schedule: 'immediate' | 'delayed', delay: number = 60) => {
    setRule(prevRule => ({
      ...prevRule,
      schedule,
      delay
    }));
    setStep(4);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/rules', rule);
      router.push('/rules');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create rule');
      } else {
        setError('An unexpected error occurred');
        console.error(err);
      }
      setLoading(false);
    }
  };

  // Render different steps of the rule builder
  const renderStep = () => {
    switch (step) {
      case 1:
        return <TriggerSelector onSelect={handleTriggerSelect} />;
      case 2:
        return <ActionSelector onSelect={handleActionSelect} />;
      case 3:
        return <ScheduleSelector onSelect={handleScheduleSelect} schedule={rule.schedule} delay={rule.delay} />;
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Review and save your rule</h2>
            
            <div className="card">
              <div className="mb-4">
                <label htmlFor="name" className="label">Rule Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={rule.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter a name for this rule"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="label">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={rule.description}
                  onChange={handleInputChange}
                  className="input h-24"
                  placeholder="Add a description to help remember what this rule does"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium mb-2">Trigger</h3>
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    {rule.triggerId ? (
                      <p>{rule.triggerId.replace(/_/g, ' ')}</p>
                    ) : (
                      <p className="text-red-500">No trigger selected</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Action</h3>
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    {rule.actionId ? (
                      <p>{rule.actionId.replace(/_/g, ' ')}</p>
                    ) : (
                      <p className="text-red-500">No action selected</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Schedule</h3>
                <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                  {rule.schedule === 'immediate' ? (
                    <p>Execute immediately</p>
                  ) : (
                    <p>Execute after {rule.delay} minutes</p>
                  )}
                </div>
              </div>
              
              {rule.conditions && rule.conditions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Conditions</h3>
                  <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <ul className="list-disc pl-5">
                      {rule.conditions.map((condition, index) => (
                        <li key={index}>
                          {condition.field} {condition.operator.replace(/_/g, ' ')} {String(condition.value)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                >
                  Start Over
                </button>
                
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any)}
                  disabled={loading || !rule.triggerId || !rule.actionId}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Create a New Automation Rule</h1>
        
        <div className="mb-6">
          <div className="card">
            <h2 className="text-lg font-medium mb-3">Use AI to create a rule</h2>
            <p className="text-gray-600 mb-4">
              Describe what you want to automate in plain language, and we'll create a rule for you.
            </p>
            
            <div className="mb-4">
              <textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                className="input h-24"
                placeholder="e.g., When a guest checks in, send a welcome email after 30 minutes"
              />
            </div>
            
            <button
              type="button"
              onClick={handleParseNaturalLanguage}
              disabled={loading || !naturalLanguageInput.trim()}
              className="btn btn-primary w-full"
            >
              {loading ? 'Parsing...' : 'Create Rule with AI'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-gray-500 text-sm">OR CREATE MANUALLY</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                4
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {step} of 4
            </div>
          </div>
          
          <div className="card">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;