
import { v4 as uuidv4 } from 'uuid';
import supabase from './supabase';
import { executeActionSafely } from './actions';
import { logError } from './errorhandling';
import { Rule } from '../types';
import { RuleEvaluationError, ConfigurationError } from '@/types/errors';
import { DLQItem } from '../types';

/**
 * Process a single item from the dead letter queue
 */
export async function processDLQItem(item: DLQItem) {
  // Get the latest rule definition (it might have changed)
  const { data: rule, error: ruleError } = await supabase
    .from('rules')
    .select('*')
    .eq('id', item.ruleId)
    .single();
    
  if (ruleError) {
    // Update DLQ item with error
    await supabase
      .from('dead_letter_queue')
      .update({
        status: 'failed',
        retryAttempts: item.retryAttempts + 1,
        lastProcessedAt: new Date().toISOString(),
        processingResult: {
          error: `Rule not found: ${ruleError.message}`,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', item.id);
      
    return { success: false, error: ruleError };
  }
  
  try {
    // Attempt to execute the action again
    const result = await executeActionSafely(
      item.actionId,
      item.actionParams,
      rule as Rule,
      {
        maxRetries: 1, // Limit retries since this is already a retry
        isRetry: true,
        context: item.context
      }
    );
    
    // Update DLQ item as processed
    await supabase
      .from('dead_letter_queue')
      .update({
        status: 'processed',
        retryAttempts: item.retryAttempts + 1,
        lastProcessedAt: new Date().toISOString(),
        processingResult: {
          success: true,
          result,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', item.id);
      
    // Log successful retry
    await supabase.from('logs').insert({
      id: uuidv4(),
      type: 'system',
      ruleName: item.ruleName,
      message: `Successfully processed dead letter queue item for rule "${item.ruleName}"`,
      details: {
        dlqItemId: item.id,
        result,
        retryAttempt: item.retryAttempts + 1
      },
      timestamp: new Date().toISOString()
    });
    
    return { success: true, result };
  } catch (error) {
    // Log retry failure

    const newError = error instanceof RuleEvaluationError ? error : new RuleEvaluationError(String(error), item.ruleId);
    const errorId = await logError(
        newError,
      item.ruleName,
      {
        dlqItemId: item.id,
        retryAttempt: item.retryAttempts + 1,
        actionId: item.actionId,
        actionParams: item.actionParams
      }
    );
    
    // Update DLQ item status
    const maxRetries = 3; // Maximum number of retries
    const finalStatus = item.retryAttempts + 1 >= maxRetries ? 'failed' : 'pending';
    
    await supabase
      .from('dead_letter_queue')
      .update({
        status: finalStatus,
        retryAttempts: item.retryAttempts + 1,
        lastProcessedAt: new Date().toISOString(),
        processingResult: {
          success: false,
          error: newError.message,
          errorId,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', item.id);
      
    return { success: false, error, errorId };
  }
}

/**
 * Process a batch of items from the dead letter queue
 */
export async function processDLQBatch(
  limit = 10,
  options: {
    olderThanMinutes?: number;
    specificIds?: string[];
    maxRetryAttempts?: number;
  } = {}
) {
  const {
    olderThanMinutes = 5,
    specificIds,
    maxRetryAttempts = 3
  } = options;
  
  try {
    // Build the query
    let query = supabase
      .from('dead_letter_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retryAttempts', maxRetryAttempts)
      .order('timestamp', { ascending: true })
      .limit(limit);
      
    // Add time filter if specified
    if (olderThanMinutes > 0) {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);
      query = query.lt('timestamp', cutoffTime.toISOString());
    }
    
    // Add specific IDs filter if provided
    if (specificIds && specificIds.length > 0) {
      query = query.in('id', specificIds);
    }
    
    // Execute query
    const { data: items, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (!items || items.length === 0) {
      return { processed: 0, results: [] };
    }
    
    // Process each item
    const results = [];
    for (const item of items) {
      results.push({
        id: item.id,
        ruleName: item.ruleName,
        result: await processDLQItem(item)
      });
    }
    
    return {
      processed: items.length,
      results
    };
  } catch (error) {
    const batchError = error instanceof ConfigurationError ? error : new ConfigurationError(String(error));

    await logError(
        batchError,
      'System',
      { operation: 'processDLQBatch', options }
    );
    throw error;
  }
}