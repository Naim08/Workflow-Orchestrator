// types/errors.ts
export class WorkflowError extends Error {
  public actionId?: string;
  public parameters?: Record<string, any>;

  constructor(message: string, actionId?: string, parameters?: Record<string, any>) {
    super(message);
    this.name = 'WorkflowError';
    this.actionId = actionId;
    this.parameters = parameters;
  }
}

export class TriggerError extends WorkflowError {
  public triggerId: string;

  constructor(message: string, triggerId: string) {
    super(`Trigger error (${triggerId}): ${message}`);
    this.name = 'TriggerError';
    this.triggerId = triggerId;
  }
}

export class ActionError extends WorkflowError {
  public actionId?: string;
  public parameters?: Record<string, any>;

  constructor(message: string, actionId?: string, parameters?: Record<string, any>) {
    super(`Action error (${actionId}): ${message}`, actionId, parameters);
    this.name = 'ActionError';
  }
}

export class RuleEvaluationError extends WorkflowError {
  public ruleId?: string;

  constructor(message: string, ruleId?: string) {
    super(`Rule evaluation error (${ruleId}): ${message}`);
    this.name = 'RuleEvaluationError';
    this.ruleId = ruleId;
  }
}

export class SchedulingError extends WorkflowError {
  constructor(message: string) {
    super(`Scheduling error: ${message}`);
    this.name = 'SchedulingError';
  }
}

export class DatabaseError extends WorkflowError {
  public originalError?: any;

  constructor(message: string, originalError?: any) {
    super(`Database error: ${message}`);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

export class ConfigurationError extends WorkflowError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigurationError';
  }
}