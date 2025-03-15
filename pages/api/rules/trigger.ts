import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';
import { executeAction } from '../../../lib/actions';
import { getTriggerById } from '../../../lib/triggers';
import { Rule, TriggerSimulationResponse } from '../../../types';

type ApiResponse<T> = 
  | { error: string }
  | T;

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
      parameters: Record<string, any> 
    };
    
    // Validation
    if (!triggerId) {
      return res.status(400).json({ error: 'Trigger ID is required' });
    }
    
    // Check if the trigger exists
    const trigger = getTriggerById(triggerId);
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
          // Execute the action
          const result = await executeAction(rule.actionId, rule.actionParams);
          
          // Log the action execution
          await supabase.from('logs').insert({
            id: uuidv4(),
            type: 'action',
            ruleName: rule.name,
            message: `Action "${rule.actionId.replace(/_/g, ' ')}" executed for rule "${rule.name}"`,
            details: result,
            timestamp: new Date().toISOString()
          });
        } 
        // For delayed execution
        else {
          // Schedule the action for later (using a setTimeout)
          const delay = rule.delay * 60 * 1000; // convert minutes to milliseconds
          
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
              // Execute the action after the delay
              const result = await executeAction(rule.actionId, rule.actionParams);
              
              // Log the delayed action execution
              await supabase.from('logs').insert({
                id: uuidv4(),
                type: 'action',
                ruleName: rule.name,
                message: `Scheduled action "${rule.actionId.replace(/_/g, ' ')}" executed for rule "${rule.name}"`,
                details: result,
                timestamp: new Date().toISOString()
              });
            } catch (err) {
              console.error(`Error executing delayed action for rule ${rule.id}:`, err);
              
              // Log the error
              await supabase.from('logs').insert({
                id: uuidv4(),
                type: 'error',
                ruleName: rule.name,
                message: `Error executing scheduled action for rule "${rule.name}"`,
                details: { error: err instanceof Error ? err.message : String(err), rule },
                timestamp: new Date().toISOString()
              });
            }
          }, delay);
        }
        
        executedRules.push(rule);
      } catch (ruleError) {
        console.error(`Error processing rule ${rule.id}:`, ruleError);
        
        // Log the error
        await supabase.from('logs').insert({
          id: uuidv4(),
          type: 'error',
          ruleName: rule.name,
          message: `Error processing rule "${rule.name}"`,
          details: { error: ruleError instanceof Error ? ruleError.message : String(ruleError), rule },
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      triggerId,
      rulesMatched: matchingRules.length,
      executedRules
    });
  } catch (error) {
    console.error('Error processing trigger:', error);
    return res.status(500).json({ error: 'Failed to process trigger' });
  }
}