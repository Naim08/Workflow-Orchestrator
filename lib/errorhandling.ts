// lib/errorHandling.ts
import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase';
import { 
  WorkflowError, ActionError, TriggerError, 
  RuleEvaluationError, SchedulingError, DatabaseError 
} from '../types/errors';
import { Rule, Log } from '../types';

/**
 * Creates a detailed log entry for an error
 */
export async function logError(
  error: Error,
  ruleName: string = 'System',
  details: Record<string, any> = {}
): Promise<string> {
  try {
    // Generate a unique error ID
    const errorId = uuidv4();
    
    // Format error details
    const errorDetails = {
      errorId,
      errorType: error.name,
      message: error.message,
      stackTrace: error.stack,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    // Create log entry
    const logEntry: Partial<Log> = {
      id: uuidv4(),
      type: 'error',
      ruleName: ruleName,
      message: `Error: ${error.message}`,
      details: errorDetails,
      timestamp: new Date().toISOString()
    };
    
    // Store in logs table
    await supabase.from('logs').insert(logEntry);
    
    // Return the error ID for reference
    return errorId;
  } catch (logError) {
    // If we can't even log the error, output to console as last resort
    console.error('Failed to log error:', logError);
    console.error('Original error:', error);
    return 'failed-to-log-' + Date.now();
  }
}

/**
 * Adds a failed action to the dead letter queue
 */
export async function addToDeadLetterQueue(
  rule: Rule,
  error: Error,
  context: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase.from('dead_letter_queue').insert({
      id: uuidv4(),
      ruleId: rule.id,
      ruleName: rule.name,
      triggerId: rule.triggerId,
      actionId: rule.actionId,
      actionParams: rule.actionParams,
      context: context,
      error: error.message,
      stackTrace: error.stack,
      timestamp: new Date().toISOString(),
      retryAttempts: 0,
      status: 'pending',
      lastProcessedAt: null
    });
  } catch (dlqError) {
    console.error('Failed to add to dead letter queue:', dlqError);
    console.error('Original error:', error);
  }
}

/**
 * Implements retry logic with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelayMs?: number;
    backoffMultiplier?: number;
    retryCondition?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelayMs = 1000,
    backoffMultiplier = 2,
    retryCondition = () => true,
    onRetry = () => {}
  } = options;
  
  let lastError: any = null;
  
  for (let attempt = 0; attempt < maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (attempt >= maxRetries || !retryCondition(error)) {
        throw error;
      }
      
      // Call the retry callback
      onRetry(error, attempt + 1);
      
      // Wait with exponential backoff before next attempt
      const delay = retryDelayMs * Math.pow(backoffMultiplier, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This code should never be reached due to the throw above,
  // but TypeScript doesn't know that, so we need to handle it
  throw lastError;
}

/**
 * Wraps an async function with structured error handling
 */
export function withErrorHandling<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>,
  options: {
    operationName: string;
    errorType?: new (message: string, ...args: any[]) => Error;
    transformError?: (error: any) => Error;
    rethrow?: boolean;
    defaultValue?: T;
    logErrors?: boolean;
  }
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const {
      operationName,
      errorType = WorkflowError,
      transformError,
      rethrow = true,
      defaultValue,
      logErrors = true
    } = options;
    
    try {
      return await operation(...args);
    } catch (error) {
      // Transform the error if requested
      const processedError = transformError
        ? transformError(error)
        : error instanceof Error
          ? error
          : new errorType(`${operationName} failed: ${error}`);
      
      // Log the error if requested
      if (logErrors) {
        await logError(processedError, 'System', { operationName, args });
      }
      
      // Rethrow or return default value
      if (rethrow) {
        throw processedError;
      }
      
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      
      throw processedError;
    }
  };
}

/**
 * The circuit breaker pattern prevents repeated execution of failing operations
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly name: string,
    private readonly threshold = 5,
    private readonly resetTimeoutMs = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      // Check if we've waited long enough to try again
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new WorkflowError(`Circuit breaker open for ${this.name}`);
      }
    }
    
    try {
      // Execute the operation
      const result = await operation();
      
      // If successful and in half-open state, reset the circuit
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      // Record the failure
      this.failures++;
      this.lastFailureTime = Date.now();
      
      // Check if we've hit the threshold
      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        
        // Log circuit open event
        await logError(
          new WorkflowError(`Circuit breaker opened for ${this.name} after ${this.failures} failures`),
          'System',
          { circuitBreakerName: this.name }
        );
      }
      
      throw error;
    }
  }
  
  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }
}

// Store circuit breakers by name
const circuitBreakers: Record<string, CircuitBreaker> = {};

/**
 * Gets or creates a circuit breaker by name
 */
export function getCircuitBreaker(name: string): CircuitBreaker {
  if (!circuitBreakers[name]) {
    circuitBreakers[name] = new CircuitBreaker(name);
  }
  return circuitBreakers[name];
}