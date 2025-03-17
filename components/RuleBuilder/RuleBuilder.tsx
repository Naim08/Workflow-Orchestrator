// components/RuleBuilder/RuleBuilder.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import TriggerSelector from './TriggerSelector';
import ActionSelector from './ActionSelector';
import ScheduleSelector from './ScheduleSelector';
import WorkflowCanvas from '../WorkflowCanvas/WorkflowCanvas';
import { getAllTriggers, getTriggerById } from '../../lib/triggers';
import { getAllActions, getActionById } from '../../lib/actions';
import { Rule, RuleCondition, ParseNaturalLanguageResponse } from '../../types';

interface RuleBuilderProps {
  initialRule?: Rule | null;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ 
  initialRule = null, 
  isEditing = false, 
  onSuccess = null 
}) => {
  const router = useRouter();
  
  // Rule fields
  const [ruleName, setRuleName] = useState<string>('');
  const [ruleDescription, setRuleDescription] = useState<string>('');
  const [trigger, setTrigger] = useState<string>('');
  const [triggerParams, settriggerParams] = useState<Record<string, any>>({});
  const [action, setAction] = useState<string>('');
  const [actionParams, setactionParams] = useState<Record<string, any>>({});
  const [schedule, setSchedule] = useState<'immediate' | 'delayed' | 'cron'>('immediate');
  const [delay, setDelay] = useState<number>(5);
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  
  // UI state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Natural language processing
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [isParsingNL, setIsParsingNL] = useState<boolean>(false);
  const [parsingResult, setParsingResult] = useState<ParseNaturalLanguageResponse | null>(null);
  
  // Track touched fields for validation
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    trigger: false,
    action: false,
    schedule: false
  });
  
  // Load initial rule data if editing
  useEffect(() => {
    if (initialRule && isEditing) {
      setRuleName(initialRule.name);
      setRuleDescription(initialRule.description || '');
      setTrigger(initialRule.triggerId);
      settriggerParams(initialRule.triggerParams || {});
      setAction(initialRule.actionId);
      setactionParams(initialRule.actionParams || {});
      setSchedule(initialRule.schedule as 'immediate' | 'delayed' | 'cron');
      setDelay(initialRule.delay || 5);
      setConditions(initialRule.conditions || []);
      
      // Mark all fields as touched for validation
      setTouchedFields({
        name: true,
        trigger: true,
        action: true,
        schedule: true
      });
    }
  }, [initialRule, isEditing]);
  
  // Mark field as touched when it's edited
  const markFieldAsTouched = (fieldName: string): void => {
    setTouchedFields({
      ...touchedFields,
      [fieldName]: true
    });
  };
  
  // Process natural language input
  const handleParseNaturalLanguage = async (): Promise<void> => {
    if (!naturalLanguageInput.trim()) {
      setError('Please enter a description of what you want to automate');
      return;
    }
    
    setIsParsingNL(true);
    setError(null);
    
    try {
      // Use the advanced parsing endpoint powered by LangChain
      const response = await axios.post<ParseNaturalLanguageResponse>('/api/openai/advanced-parse', {
        text: naturalLanguageInput
      });
      
      const result = response.data;
      setParsingResult(result);
      
      // Update the rule with the parsed data
      setRuleName(result.description || `Rule from "${naturalLanguageInput.substring(0, 30)}${naturalLanguageInput.length > 30 ? '...' : ''}"`);
      setRuleDescription(result.description || '');
      setTrigger(result.triggerId);
      setAction(result.actionId);
      setSchedule(result.schedule);
      setDelay(result.delay || 5);
      setConditions(result.conditions || []);
      
      // Fetch trigger parameters based on the identified trigger
      if (result.triggerId) {
        const triggerDef = getTriggerById(result.triggerId);
        if (triggerDef) {
          const defaultTriggerParams: Record<string, any> = {};
          triggerDef.parameters.forEach(param => {
            defaultTriggerParams[param.name] = param.default !== undefined ? param.default : '';
          });
          settriggerParams(defaultTriggerParams);
        }
      }
      
      // Fetch action parameters based on the identified action
      if (result.actionId) {
        const actionDef = getActionById(result.actionId);
        if (actionDef) {
          const defaultActionParams: Record<string, any> = {};
          actionDef.parameters.forEach(param => {
            defaultActionParams[param.name] = param.default !== undefined ? param.default : '';
          });
          setactionParams(defaultActionParams);
        }
      }
      
      // Mark fields as touched for validation
      setTouchedFields({
        name: true,
        trigger: true,
        action: true,
        schedule: true
      });
      
      // Skip to the review step
      setCurrentStep(5);
    } catch (err) {
      console.error('Error parsing natural language:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to parse your description. Please try again or build your rule manually.');
      } else {
        setError('An unexpected error occurred. Please try again or build your rule manually.');
      }
    } finally {
      setIsParsingNL(false);
    }
  };
  
  // Update trigger and trigger parameters
  const handleTriggerChange = (triggerId: string): void => {
    setTrigger(triggerId);
    markFieldAsTouched('trigger');
    
    // If changing trigger type, we need to reset trigger parameters
    const newTrigger = getTriggerById(triggerId);
    if (newTrigger) {
      const defaultParams: Record<string, any> = {};
      newTrigger.parameters.forEach(param => {
        defaultParams[param.name] = param.default !== undefined ? param.default : '';
      });
      settriggerParams(defaultParams);
    }
  };
  
  // Update trigger parameters
  const handletriggerParamsChange = (newParams: Record<string, any>): void => {
    settriggerParams(newParams);
  };
  
  // Update action and action parameters
  const handleActionChange = (actionId: string): void => {
    setAction(actionId);
    markFieldAsTouched('action');
    
    // If changing action type, we need to reset action parameters
    const newAction = getActionById(actionId);
    if (newAction) {
      const defaultParams: Record<string, any> = {};
      newAction.parameters.forEach(param => {
        defaultParams[param.name] = param.default !== undefined ? param.default : '';
      });
      setactionParams(defaultParams);
    }
  };
  
  // Update action parameters
  const handleactionParamsChange = (newParams: Record<string, any>): void => {
    setactionParams(newParams);
  };
  
  // Update schedule
  const handleScheduleChange = (newSchedule: 'immediate' | 'delayed' | 'cron'): void => {
    setSchedule(newSchedule);
    markFieldAsTouched('schedule');
  };
  
  // Move to next step
  const handleNextStep = (): void => {
    setCurrentStep(currentStep + 1);
  };
  
  // Move to previous step
  const handlePrevStep = (): void => {
    setCurrentStep(currentStep - 1);
  };
  
  // Validate inputs for the current step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return ruleName.trim().length > 0;
      case 2:
        if (!trigger) return false;
        
        const triggerDef = getTriggerById(trigger);
        if (!triggerDef) return false;
        
        // Check required trigger parameters
        for (const param of triggerDef.parameters) {
          if (param.required && (triggerParams[param.name] === undefined || triggerParams[param.name] === '')) {
            return false;
          }
        }
        
        return true;
      case 3:
        if (!action) return false;
        
        const actionDef = getActionById(action);
        if (!actionDef) return false;
        
        // Check required action parameters
        for (const param of actionDef.parameters) {
          if (param.required && (actionParams[param.name] === undefined || actionParams[param.name] === '')) {
            return false;
          }
        }
        
        return true;
      case 4:
        return schedule === 'immediate' || (schedule === 'delayed' && delay > 0);
      default:
        return true;
    }
  };
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const rule = {
      name: ruleName,
      description: ruleDescription,
      triggerId: trigger,
      triggerParams,
      actionId: action,
      actionParams,
      schedule,
      delay: schedule === 'delayed' ? delay : 0,
      enabled: initialRule ? initialRule.enabled : true,
      conditions
    };
    
    try {
      if (isEditing && initialRule) {
        // Preserve any existing fields that might not be in the form
        const preservedFields: Record<string, any> = {};
        
        // Check if the trigger type has changed
        if (initialRule.triggerId !== trigger) {
          // If trigger has changed, use new trigger parameters
          console.log('Trigger changed, using new parameters');
        } else {
          // Only update parameters that were actually changed
          const triggerDef = getTriggerById(trigger);
          if (triggerDef) {
            for (const param of triggerDef.parameters) {
              // If parameter wasn't touched, preserve original value
              if (initialRule.triggerParams && 
                  initialRule.triggerParams[param.name] !== undefined &&
                  triggerParams[param.name] === undefined) {
                if (!rule.triggerParams) rule.triggerParams = {};
                rule.triggerParams[param.name] = initialRule.triggerParams[param.name];
              }
            }
          }
        }
        
        // Check if the action type has changed
        if (initialRule.actionId !== action) {
          // If action has changed, use new action parameters
          console.log('Action changed, using new parameters');
        } else {
          // Only update parameters that were actually changed
          const actionDef = getActionById(action);
          if (actionDef) {
            for (const param of actionDef.parameters) {
              // If parameter wasn't touched, preserve original value
              if (initialRule.actionParams && 
                  initialRule.actionParams[param.name] !== undefined &&
                  actionParams[param.name] === undefined) {
                if (!rule.actionParams) rule.actionParams = {};
                rule.actionParams[param.name] = initialRule.actionParams[param.name];
              }
            }
          }
        }
        
        // Update existing rule
        await axios.put(`/api/rules/${initialRule.id}`, rule);
      } else {
        // Create new rule
        await axios.post('/api/rules', rule);
      }
      
      setSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/rules');
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving rule:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'An error occurred while saving the rule.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate a preview rule for the workflow canvas
  const getPreviewRule = (): Rule => {
    return {
      id: initialRule?.id || 'preview',
      name: ruleName || 'New Rule',
      description: ruleDescription,
      triggerId: trigger,
      triggerParams,
      actionId: action,
      actionParams,
      schedule,
      delay: schedule === 'delayed' ? delay : 0,
      enabled: true,
      createdAt: initialRule?.createdAt || new Date().toISOString(),
      conditions
    } as Rule;
  };
  
  // Show the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Rule Details</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rule Name *</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => {
                  setRuleName(e.target.value);
                  markFieldAsTouched('name');
                }}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Send welcome email to new guests"
                required
              />
              {touchedFields.name && !ruleName.trim() && (
                <p className="text-red-500 text-xs mt-1">Rule name is required</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={ruleDescription}
                onChange={(e) => setRuleDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what this rule does"
                rows={3}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Trigger</h2>
            <p className="text-gray-600">Choose what event will trigger this automation</p>
            
            <TriggerSelector
              selectedTriggerId={trigger}
              onSelectTrigger={handleTriggerChange}
              parameters={triggerParams}
              onParametersChange={handletriggerParamsChange}
            />
            
            {touchedFields.trigger && !trigger && (
              <p className="text-red-500 text-xs">Please select a trigger</p>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Action</h2>
            <p className="text-gray-600">Choose what happens when the trigger occurs</p>
            
            <ActionSelector
              selectedActionId={action}
              onSelectAction={handleActionChange}
              parameters={actionParams}
              onParametersChange={handleactionParamsChange}
            />
            
            {touchedFields.action && !action && (
              <p className="text-red-500 text-xs">Please select an action</p>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Schedule</h2>
            <p className="text-gray-600">Choose when the action should be executed</p>
            
            <ScheduleSelector
              schedule={schedule}
              delay={delay}
              onScheduleChange={handleScheduleChange}
              onDelayChange={setDelay}
            />
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review & Confirm</h2>
            <p className="text-gray-600">Review your rule configuration</p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium">{ruleName}</h3>
              {ruleDescription && <p className="text-gray-600 text-sm mt-1">{ruleDescription}</p>}
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">WORKFLOW PREVIEW</h4>
                <div className="mt-2 border bg-white rounded p-4">
                  <WorkflowCanvas rule={getPreviewRule()} />
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Trigger:</span> {getTriggerById(trigger)?.name || trigger?.replace(/_/g, ' ')}
                </div>
                <div>
                  <span className="font-medium">Action:</span> {getActionById(action)?.name || action?.replace(/_/g, ' ')}
                </div>
                <div>
                  <span className="font-medium">Schedule:</span>{' '}
                  {schedule === 'immediate' ? 'Immediate' : `Delayed by ${delay} minutes`}
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                {/* Trigger Parameters Summary */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500">TRIGGER PARAMETERS</h4>
                  {Object.keys(triggerParams).length > 0 ? (
                    <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(triggerParams).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{' '}
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">No parameters</p>
                  )}
                </div>
                
                {/* Action Parameters Summary */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500">ACTION PARAMETERS</h4>
                  {Object.keys(actionParams).length > 0 ? (
                    <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(actionParams).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{' '}
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">No parameters</p>
                  )}
                </div>
                
                {/* Conditions Summary */}
                {conditions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">CONDITIONS</h4>
                    <div className="mt-1">
                      <ul className="list-disc pl-5 text-sm">
                        {conditions.map((condition, index) => (
                          <li key={index}>
                            {condition.field} {condition.operator.replace(/_/g, ' ')} {String(condition.value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* AI-powered rule creation for new rules only */}
      {!isEditing && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-3">Use AI to create a rule</h2>
            <p className="text-gray-600 mb-4">
              Describe what you want to automate in plain language, and we'll create a rule for you.
            </p>
            
            <div className="mb-4">
              <textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., When a guest checks in, send a welcome email after 30 minutes"
                rows={3}
              />
            </div>
            
            <button
              type="button"
              onClick={handleParseNaturalLanguage}
              disabled={isParsingNL || !naturalLanguageInput.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 w-full"
            >
              {isParsingNL ? 'Creating...' : 'Create Rule with AI'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
          
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-100 px-3 text-gray-500 text-sm">OR CREATE MANUALLY</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Manual rule builder */}
      <div className="bg-white rounded-lg shadow p-6">
        {success ? (
          <div className="text-center py-8">
            <div className="text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isEditing ? 'Rule updated successfully!' : 'Rule created successfully!'}
            </h2>
            <p className="text-gray-600">Redirecting you to the rules page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        currentStep === step
                          ? 'bg-blue-500 text-white'
                          : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {currentStep > step ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    {step < 5 && (
                      <div
                        className={`flex-1 h-1 ${
                          currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {renderStep()}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/rules')}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={!validateCurrentStep() || isSubmitting}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RuleBuilder;