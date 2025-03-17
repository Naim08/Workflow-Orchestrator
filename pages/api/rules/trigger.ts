import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';
import { executeActionSafely } from '../../../lib/actions';
import { getTriggerById } from '../../../lib/triggers';
import { Rule, TriggerSimulationResponse } from '../../../types';
import { TriggerError, SchedulingError } from '@/types/errors';
import { withErrorHandling, logError, withRetry } from '@/lib/errorhandling';

type ApiResponse<T> = 
  | { error: string }
  | T;

interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with';
  value: string | number | boolean;
}


interface Parameters {
  [key: string]: string | number | boolean;
}

// Handler for /api/rules/trigger
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TriggerSimulationResponse>>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  try {
    const { triggerId, parameters } = req.body as { 
      triggerId: string; 
      parameters: Parameters 
    };
    
    // Validation
    if (!triggerId) {
      return res.status(400).json({ error: 'Trigger ID is required' });
    }
    
    // Check if the trigger exists
    const trigger = await getTriggerById(triggerId);
    if (!trigger) {
      return res.status(400).json({ error: `Trigger "${triggerId}" not found` });
    }
    
    // Find all enabled rules that use this trigger
    const { data: matchingRules, error: rulesError } = await supabase
      .from('rules')
      .select('*')
      .eq('triggerId', triggerId)
      .eq('enabled', true);
    
    if (rulesError) throw rulesError;
    
    // Log the trigger event
    const logId = uuidv4();
    await supabase.from('logs').insert({
      id: logId,
      type: 'trigger',
      ruleName: 'System',
      message: `Trigger "${trigger.name}" fired`,
      details: { triggerId, parameters },
      timestamp: new Date().toISOString()
    });
    
    // Process each matching rule
    const executedRules: Rule[] = [];
    
    for (const rule of matchingRules as Rule[]) {
      try {
        // Check if conditions are met
        if (!shouldExecuteRule(rule, parameters)) {
          // Log condition mismatch
          await supabase.from('logs').insert({
            id: uuidv4(),
            type: 'system',
            ruleName: rule.name,
            message: `Rule "${rule.name}" conditions not met for trigger "${trigger.name}"`,
            details: { ruleId: rule.id, triggerId, parameters, conditions: rule.conditions },
            timestamp: new Date().toISOString()
          });
          continue;
        }
        
        // Log rule match
        await supabase.from('logs').insert({
          id: uuidv4(),
          type: 'system',
          ruleName: rule.name,
          message: `Rule "${rule.name}" matched trigger "${trigger.name}"`,
          details: { ruleId: rule.id, triggerId },
          timestamp: new Date().toISOString()
        });
        
        // For immediate execution
        if (rule.schedule === 'immediate') {
          // Execute the action with error handling
          await executeActionSafely(
            rule.actionId, 
            rule.actionParams, 
            rule, 
            { 
              context: { trigger: { id: triggerId, parameters } } 
            }
          );
        } 
        // For delayed execution
        else {
          // Schedule the action for later (using a setTimeout)
          const delay = rule.delay! * 60 * 1000; // convert minutes to milliseconds
          
          // Log the scheduling
          await supabase.from('logs').insert({
            id: uuidv4(),
            type: 'system',
            ruleName: rule.name,
            message: `Action "${rule.actionId.replace(/_/g, ' ')}" scheduled for rule "${rule.name}" (delay: ${rule.delay} minutes)`,
            details: { rule, delay },
            timestamp: new Date().toISOString()
          });
          
          // Schedule the execution
          setTimeout(async () => {
            try {
              // Execute the action after the delay with error handling
              await executeActionSafely(
                rule.actionId, 
                rule.actionParams, 
                rule, 
                { 
                  context: { 
                    trigger: { id: triggerId, parameters },
                    scheduledAt: new Date().toISOString(),
                    delay: rule.delay
                  } 
                }
              );
            } catch (err) {
              // Error handling is inside executeActionSafely, this is just a fallback
              console.error(`Error executing delayed action for rule ${rule.id}:`, err);
            }
          }, delay);
        }
        
        executedRules.push(rule);
      } catch (ruleError) {
        // Log rule processing error
        const errorId = await logError(
          ruleError instanceof Error 
            ? ruleError 
            : new TriggerError(`Failed to process rule: ${ruleError}`, rule.id),
          'System',
          { ruleId: rule.id, triggerId, parameters }
        );
        
        console.error(`Error processing rule ${rule.id}:`, ruleError);
      }
    }
    
    return res.status(200).json({ success: true, triggerId: triggerId, rulesMatched: matchingRules.length, executedRules });
  } catch (error) {
    const errorId = await logError(
      error instanceof Error 
        ? error 
        : new TriggerError(`Failed to process trigger: ${error}`, req.body?.triggerId || 'unknown'),
      'System',
      { body: req.body }
    );
    
    console.error('Error processing trigger:', error);
    return res.status(500).json({ 
      error: `Failed to process trigger (Error ID: ${errorId})` 
    });
  }
}

const shouldExecuteRule = (rule: Rule, parameters: Record<string, any>): boolean => {
  // If no conditions, always execute
  if (!rule.conditions || rule.conditions.length === 0) {
    return true;
  }
  
  // Simple condition checking - you can enhance this based on your conditional logic
  return rule.conditions.every(condition => {
    const value = parameters[condition.field];
    switch (condition.operator) {
      case 'equals': return value === condition.value;
      case 'not_equals': return value !== condition.value;
      case 'contains': return String(value).includes(String(condition.value));
      // Add other operators as needed
      default: return true;
    }
  });
};




