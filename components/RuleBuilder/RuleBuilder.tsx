import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import TriggerSelector from './TriggerSelector';
import ActionSelector from './ActionSelector';
import ScheduleSelector from './ScheduleSelector';
import { Rule, RuleCondition, ParseNaturalLanguageResponse } from '../../types';

type RuleFormState = Omit<Rule, 'id' | 'enabled' | 'createdAt' | 'updatedAt'> & {
  conditions?: RuleCondition[];
};

interface RuleBuilderProps {
  /** If provided, we are in edit mode and can populate from this existing rule. */
  initialRule?: Rule;
  /** True for edit mode, false/undefined for creating a new rule. */
  isEditing?: boolean;
  /** Callback if you want to do something after successfully creating/updating. */
  onSuccess?: () => void;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  initialRule,
  isEditing = false,
  onSuccess
}) => {
  const router = useRouter();

  // The current step of the wizard (1..4)
  const [step, setStep] = useState<number>(isEditing ? 1 : 1);

  // For "AI parse" or final submit
  const [loading, setLoading] = useState<boolean>(false);

  // Error message
  const [error, setError] = useState<string | null>(null);

  // For AI-based creation
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [parsingResult, setParsingResult] = useState<ParseNaturalLanguageResponse | null>(null);

  // Local form data
  const [rule, setRule] = useState<RuleFormState>({
    name: '',
    description: '',
    triggerId: '',
    triggerParams: {},
    actionId: '',
    actionParams: {},
    schedule: 'immediate',
    delay: 60,
    conditions: []
  });

  /**
   * If we are in edit mode and have an initialRule, populate local state.
   * We jump directly to step 4 so the user sees the final "Review & Save."
   */
  useEffect(() => {
    if (isEditing && initialRule) {
      setRule({
        name: initialRule.name || '',
        description: initialRule.description || '',
        triggerId: initialRule.triggerId || '',
        triggerParams: initialRule.triggerParams || {},
        actionId: initialRule.actionId || '',
        actionParams: initialRule.actionParams || {},
        schedule: initialRule.schedule,
        delay: initialRule.delay,
        conditions: initialRule.conditions || []
      });
    }
  }, [isEditing, initialRule]);

  /** AI-based parse of natural language input. */
  const handleParseNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) {
      setError('Please enter a description of the rule');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ParseNaturalLanguageResponse>(
        '/api/openai/advanced-parse',
        { text: naturalLanguageInput }
      );
      const result = response.data;
      setParsingResult(result);

      // Transfer results into local rule state
      setRule((prev) => ({
        ...prev,
        name:
          result.description ||
          `Rule from "${naturalLanguageInput.substring(0, 30)}${
            naturalLanguageInput.length > 30 ? '...' : ''
          }"`,
        description: result.description || '',
        triggerId: result.triggerId,
        actionId: result.actionId,
        schedule: result.schedule,
        delay: result.delay || 60,
        conditions: result.conditions || []
      }));

      // Move user to step 4 for final review
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

  /** Basic handler for name/description text fields. */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRule((prev) => ({ ...prev, [name]: value }));
  };

  /** Wizard step callback: pick a trigger. */
  const handleTriggerSelect = (triggerId: string, params: Record<string, any> = {}) => {
    setRule((prev) => ({ ...prev, triggerId, triggerParams: params }));
    setStep(2);
  };

  /** Wizard step callback: pick an action. */
  const handleActionSelect = (actionId: string, params: Record<string, any> = {}) => {
    setRule((prev) => ({ ...prev, actionId, actionParams: params }));
    setStep(3);
  };

  /** Wizard step callback: pick schedule type. */
  const handleScheduleSelect = (schedule: 'immediate' | 'delayed', delay: number = 60) => {
    setRule((prev) => ({ ...prev, schedule, delay }));
    setStep(4);
  };

  /** Submit (step 4). Create with POST, or edit with PUT. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialRule) {
        // Edit
        await axios.put(`/api/rules/${initialRule.id}`, {
          ...rule
        });
      } else {
        // Create
        await axios.post('/api/rules', rule);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/rules');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save rule');
      } else {
        setError('An unexpected error occurred');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders the content for the current step. Steps 1–3 are plain divs.
   * Step 4 is returned as a <form> so that Enter or the submit button will only
   * submit the final step, not the earlier ones.
   */
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <TriggerSelector onSelect={handleTriggerSelect} />;

      case 2:
        return <ActionSelector onSelect={handleActionSelect} />;

      case 3:
        return <ScheduleSelector onSelect={handleScheduleSelect} schedule={rule.schedule} delay={rule.delay} />;


      case 4:
        // Final "Review & Save" step as a form:
        return (
          <form onSubmit={handleSubmit} className="card p-4 space-y-4">
            <h2 className="text-xl font-medium">
              Review and {isEditing ? 'Update' : 'Save'} Your Rule
            </h2>

            <div>
              <label htmlFor="name" className="label">
                Rule Name
              </label>
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

            <div>
              <label htmlFor="description" className="label">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={rule.description}
                onChange={handleInputChange}
                className="input h-24"
                placeholder="Add a description to help remember what this rule does"
              />
            </div>

            {/* Trigger & Action Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <h3 className="font-medium mb-2">Schedule</h3>
              <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                {rule.schedule === 'immediate' ? (
                  <p>Execute immediately</p>
                ) : (
                  <p>Execute after {rule.delay} minutes</p>
                )}
              </div>
            </div>

            {/* Conditions */}
            {rule.conditions && rule.conditions.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Conditions</h3>
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <ul className="list-disc pl-5">
                    {rule.conditions.map((condition, index) => (
                      <li key={index}>
                        {condition.field} {condition.operator.replace(/_/g, ' ')}{' '}
                        {String(condition.value)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between">
              {/* Show "Start Over" if not editing. If editing, you might show "Cancel" etc. */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                >
                  Start Over
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !rule.triggerId || !rule.actionId}
                className="btn btn-primary"
              >
                {loading
                  ? isEditing
                    ? 'Updating...'
                    : 'Saving...'
                  : isEditing
                  ? 'Update Rule'
                  : 'Save Rule'}
              </button>
            </div>

            {/* Show any error from final submission */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </form>
        );

      default:
        // shouldn't happen, but just in case
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Automation Rule' : 'Create a New Automation Rule'}
        </h1>

        {/* If not editing, show AI-based parse + step indicators. Otherwise, skip them. */}
        {!isEditing && (
          <>
            {/* AI-based creation */}
            <div className="mb-6">
              <div className="card">
                <h2 className="text-lg font-medium mb-3">Use AI to Create a Rule</h2>
                <p className="text-gray-600 mb-4">
                  Describe what you want to automate in plain language, and
                  we’ll try to build a rule for you.
                </p>
                <div className="mb-4">
                  <textarea
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    className="input h-24"
                    placeholder='e.g., "When a guest checks in, send a welcome email after 30 minutes"'
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

            {/* Divider */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-gray-500 text-sm">
                    OR CREATE MANUALLY
                  </span>
                </div>
              </div>
            </div>

            {/* Step indicators for steps 1..4 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">Step {step} of 4</div>
              </div>
            </div>
          </>
        )}

        {/* Render the step content. */}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default RuleBuilder;
