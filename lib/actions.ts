
import { v4 as uuidv4 } from 'uuid';
import { 
  withRetry, withErrorHandling, 
  logError, getCircuitBreaker , addToDeadLetterQueue
} from './errorhandling';
import { ActionError } from '@/types/errors';
import { Action, ActionExecutionResult, Rule } from '../types';
import supabase from './supabase';

// Define available actions for the system
const actions: Action[] = [
  {
    id: 'send_email',
    name: 'Send an email',
    description: 'Sends an email to the specified recipient',
    category: 'communication',
    parameters: [
      {
        name: 'to',
        type: 'string',
        required: true,
        description: 'Email recipient'
      },
      {
        name: 'subject',
        type: 'string',
        required: true,
        description: 'Email subject'
      },
      {
        name: 'body',
        type: 'text',
        required: true,
        description: 'Email body'
      }
    ]
  },
  {
    id: 'send_slack',
    name: 'Send Slack message',
    description: 'Sends a message to a Slack channel',
    category: 'communication',
    parameters: [
      {
        name: 'channel',
        type: 'string',
        required: true,
        description: 'Slack channel'
      },
      {
        name: 'message',
        type: 'text',
        required: true,
        description: 'Message text'
      }
    ]
  },
  {
    id: 'create_task',
    name: 'Create a task',
    description: 'Creates a new task in the task management system',
    category: 'task',
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Task title'
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        description: 'Task description'
      },
      {
        name: 'assignee',
        type: 'string',
        required: false,
        description: 'Person assigned to the task'
      },
      {
        name: 'dueDate',
        type: 'date',
        required: false,
        description: 'Due date for the task'
      }
    ]
  },
  {
    id: 'update_status',
    name: 'Update status',
    description: 'Updates the status of an entity',
    category: 'system',
    parameters: [
      {
        name: 'entityType',
        type: 'string',
        required: true,
        description: 'Type of entity (booking, property, etc.)'
      },
      {
        name: 'entityId',
        type: 'string',
        required: true,
        description: 'ID of the entity'
      },
      {
        name: 'status',
        type: 'string',
        required: true,
        description: 'New status value'
      }
    ]
  },
  {
    id: 'send_sms',
    name: 'Send SMS',
    description: 'Sends an SMS to the specified phone number',
    category: 'communication',
    parameters: [
      {
        name: 'phoneNumber',
        type: 'string',
        required: true,
        description: 'Recipient phone number'
      },
      {
        name: 'message',
        type: 'text',
        required: true,
        description: 'Message text'
      }
    ]
  },
  {
    id: 'webhook',
    name: 'Call webhook',
    description: 'Makes an HTTP request to a webhook URL',
    category: 'integration',
    parameters: [
      {
        name: 'url',
        type: 'string',
        required: true,
        description: 'Webhook URL'
      },
      {
        name: 'method',
        type: 'string',
        required: true,
        description: 'HTTP method (GET, POST, etc.)',
        default: 'POST'
      },
      {
        name: 'payload',
        type: 'text',
        required: false,
        description: 'JSON payload'
      }
    ]
  },
  {
    id: 'test_failure',
    name: 'Test Failure Action',
    description: 'An action that fails on purpose for testing error handling',
    category: 'testing',
    parameters: [
      {
        name: 'shouldFail',
        type: 'boolean',
        required: false,
        description: 'Whether this action should fail',
        default: true
      },
      {
        name: 'failureMessage',
        type: 'string',
        required: false,
        description: 'Custom failure message',
        default: 'Intentional test failure'
      },
      {
        name: 'failureType',
        type: 'string',
        required: false,
        description: 'Type of failure to simulate',
        default: 'error' // Options: error, timeout, intermittent
      }
    ]
  }
];

// Get a list of all available actions
export function getAllActions(): Action[] {
  return actions;
}

// Get an action by ID
export function getActionById(actionId: string): Action | undefined {
  return actions.find(action => action.id === actionId);
}

// Get actions by category
export function getActionsByCategory(category: string): Action[] {
  return actions.filter(action => action.category === category);
}

// Map a natural language action to an action ID
export function mapNaturalLanguageToActionId(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Simple mapping based on keywords
  if (lowerText.includes('email')) {
    return 'send_email';
  }
  if (lowerText.includes('slack')) {
    return 'send_slack';
  }
  if (lowerText.includes('task')) {
    return 'create_task';
  }
  if (lowerText.includes('status')) {
    return 'update_status';
  }
  if (lowerText.includes('sms') || lowerText.includes('text message')) {
    return 'send_sms';
  }
  if (lowerText.includes('webhook') || lowerText.includes('http')) {
    return 'webhook';
  }
  
  // Default to the first action if no match found
  return actions[0].id;
}

// Function to execute actions (mocked for MVP)
export async function executeAction(actionId: string, parameters: Record<string, any>): Promise<ActionExecutionResult> {
  console.log(`[MOCK] Executing action ${actionId} with parameters:`, parameters);
  const action = getActionById(actionId);
  if (!action) {
    throw new Error(`Action with ID ${actionId} not found`);
  }
  
  // Handle the test failure action
  if (actionId === 'test_failure') {
    const shouldFail = parameters.shouldFail !== false; // Default to true
    const failureMessage = parameters.failureMessage || 'Intentional test failure';
    const failureType = parameters.failureType || 'error';
    console.log(`[MOCK] Test failure action: ${failureType} - ${failureMessage}`);
    if (shouldFail) {
      switch (failureType) {
        case 'timeout':
          // Simulate a timeout
          await new Promise(resolve => setTimeout(resolve, 10000));
          throw new Error(`Timeout: ${failureMessage}`);
          
        case 'intermittent':
          // Fail randomly about 75% of the time
          if (Math.random() < 0.75) {
            throw new Error(`Intermittent failure: ${failureMessage}`);
          }
          break;
          
        case 'error':
        default:
          // Simple error
          throw new Error(failureMessage);
      }
    }
    
    // If we get here, the action "succeeded"
    return {
      success: true,
      message: 'Test action completed successfully',
      mock: true
    };
  }
  
  // Mock execution based on action type
  switch (actionId) {
    case 'send_email':
      console.log(`[MOCK] Email sent to ${parameters.to} with subject "${parameters.subject}"`);
      return {
        success: true,
        message: `Email would be sent to ${parameters.to}`,
        mock: true
      };
      
    case 'send_slack':
      console.log(`[MOCK] Slack message sent to channel ${parameters.channel}`);
      return {
        success: true,
        message: `Slack message would be sent to #${parameters.channel}`,
        mock: true
      };
      
    case 'create_task':
      console.log(`[MOCK] Task created: ${parameters.title}`);
      return {
        success: true,
        message: `Task "${parameters.title}" would be created`,
        mock: true,
        taskId: `task-${Date.now()}`
      };
      
    case 'update_status':
      console.log(`[MOCK] Updated status of ${parameters.entityType} ${parameters.entityId} to "${parameters.status}"`);
      return {
        success: true,
        message: `Status of ${parameters.entityType} ${parameters.entityId} would be updated to "${parameters.status}"`,
        mock: true
      };
      
    case 'send_sms':
      console.log(`[MOCK] SMS sent to ${parameters.phoneNumber}`);
      return {
        success: true,
        message: `SMS would be sent to ${parameters.phoneNumber}`,
        mock: true
      };
      
    case 'webhook':
      console.log(`[MOCK] Webhook called: ${parameters.method} ${parameters.url}`);
      return {
        success: true,
        message: `Webhook ${parameters.url} would be called with method ${parameters.method}`,
        mock: true
      };
      
    default:
      throw new Error(`Execution for action ${actionId} not implemented`);
  }
}


export async function executeActionSafely(
  actionId: string, 
  parameters: Record<string, any>,
  rule?: Rule,
  options: {
    maxRetries?: number;
    isRetry?: boolean;
    context?: Record<string, any>;
  } = {}
): Promise<ActionExecutionResult> {
  const { maxRetries = 3, isRetry = false, context = {} } = options;
  const action = getActionById(actionId);
  
  if (!action) {
    throw new ActionError(`Action with ID ${actionId} not found`, actionId, parameters);
  }
  
  // Get the circuit breaker for this action type
  const circuitBreaker = getCircuitBreaker(`action:${actionId}`);
  
  // Create a clean execution function
  const executeActionFunction = async (): Promise<ActionExecutionResult> => {
    // Start timing the execution
    const startTime = Date.now();
    
    // Execute wrapped in retry logic
    return await withRetry(
      async () => {
        // This is where your original executeAction logic goes
        const result = await executeAction(actionId, parameters);
        
        // Log successful execution
        await supabase.from('logs').insert({
          id: uuidv4(),
          type: 'action',
          ruleName: rule?.name || 'Manual Action',
          message: `Action "${action.name}" executed successfully`,
          details: {
            actionId,
            parameters,
            result,
            executionTime: Date.now() - startTime,
            isRetry
          },
          timestamp: new Date().toISOString()
        });
        
        return result;
      },
      {
        maxRetries,
        retryDelayMs: 1000,
        backoffMultiplier: 2,
        // Only retry on certain errors - customize as needed
        retryCondition: (error) => {
          // Don't retry on invalid parameters or missing resources
          if (error.message.includes('Invalid parameters') || 
              error.message.includes('not found')) {
            return false;
          }
          // Retry on transient errors
          return true;
        },
        onRetry: async (error, attempt) => {
          // Log each retry attempt
          await supabase.from('logs').insert({
            id: uuidv4(),
            type: 'error',
            ruleName: rule?.name || 'Manual Action',
            message: `Retry attempt ${attempt}/${maxRetries} for action "${action.name}"`,
            details: {
              actionId,
              parameters,
              error: error.message,
              attempt,
              timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          });
        }
      }
    );
  };
  
  try {
    // Execute with circuit breaker
    return await circuitBreaker.execute(executeActionFunction);
  } catch (error: any) {
    // Enhanced error with action details

    const actionError = new ActionError(
      error.message || 'Action execution failed',
      actionId,
      parameters
    );
    
    // Log the error
    const errorId = await logError(
      actionError,
      rule?.name || 'Manual Action',
      {
        actionId,
        parameters,
        rule: rule ? { id: rule.id, name: rule.name } : undefined,
        context
      }
    );

    // Add to dead letter queue if this was from a rule
    if (rule) {
      await addToDeadLetterQueue(rule, actionError, context);
    }
    
    // Rethrow with error ID for tracking
    actionError.message = `${actionError.message} (Error ID: ${errorId})`;
    throw actionError;
  }
}

export default actions;