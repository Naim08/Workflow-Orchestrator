// Core Trigger Type
export interface TriggerParameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: any;
  }
  
  export interface Trigger {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: TriggerParameter[];
  }
  
  // Core Action Type
  export interface ActionParameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: any;
  }
  
  export interface Action {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: ActionParameter[];
  }
  
  // Rule Condition Type
  export interface RuleCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';
    value: string | number | boolean;
  }
  
  // Rule Type
  export interface Rule {
    id: string;
    name: string;
    description?: string;
    triggerId: string;
    triggerParams: Record<string, any>;
    actionId: string;
    actionParams: Record<string, any>;
    schedule: 'immediate' | 'delayed';
    delay: number;
    conditions?: RuleCondition[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  // Log Type
  export interface Log {
    id: string;
    type: 'trigger' | 'action' | 'system' | 'error';
    ruleName: string;
    message: string;
    details?: any;
    timestamp: string;
  }
  
  // API Response Types
  export interface ParseNaturalLanguageResponse {
    trigger: string;
    triggerId: string;
    action: string;
    actionId: string;
    schedule: 'immediate' | 'delayed';
    delay?: number;
    conditions?: RuleCondition[];
    description?: string;
  }
  
  export interface TriggerSimulationResponse {
    success: boolean;
    triggerId: string;
    rulesMatched: number;
    executedRules: Rule[];
  }
  
  export interface ActionExecutionResult {
    success: boolean;
    message: string;
    mock: boolean;
    [key: string]: any;
  }
  
  // LangChain Types
  export interface LangChainParseResult {
    trigger: string;
    action: string;
    schedule: 'immediate' | 'delayed';
    delay?: number;
    conditions?: RuleCondition[];
    description?: string;
  }

  export interface DLQItem {
    id: string;
    ruleId: string;
    ruleName: string;
    triggerId: string;
    actionId: string;
    error: string;
    timestamp: string;
    retryAttempts: number;
    status: 'pending' | 'processing' | 'processed' | 'failed';
    lastProcessedAt?: string;
    processingResult?: any;
    actionParams: Record<string, any>;
    context?: Record<string, any>;
    stackTrace?: string;
  }

  interface DeleteRequestBody {
    status?: string;
    olderThan?: number;
    ids?: string[];
  }