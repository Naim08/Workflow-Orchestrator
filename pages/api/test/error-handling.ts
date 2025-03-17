import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logError } from '../../../lib/errorhandling';
import { executeActionSafely } from '../../../lib/actions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  const { scenario = 'basic' } = req.body;
  
  try {
    let result;
    
    switch (scenario) {
      case 'create-failing-rule':
        // Create a rule that will fail
        result = await createFailingRule();
        break;
        
      case 'trigger-failing-rule':
        // Trigger a rule that will fail
        result = await triggerFailingRule(req.body.ruleId);
        break;
        
      case 'list-dlq':
        // List items in the DLQ
        result = await listDLQ();
        break;
        
      case 'process-dlq':
        // Process all pending DLQ items
        result = await processDLQ();
        break;
        
      case 'retry-dlq-item':
        // Retry a specific DLQ item
        result = await retryDLQItem(req.body.itemId);
        break;
        
      case 'end-to-end':
        // Run the entire flow
        result = await runEndToEndTest();
        break;
        
      default:
        return res.status(400).json({ error: 'Unknown test scenario' });
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    const errorId = await logError(
      error,
      'Testing',
      { scenario: req.body.scenario }
    );
    
    res.status(500).json({
      error: `Test failed (Error ID: ${errorId})`,
      details: error.message
    });
  }
}

// Function to create a failing rule
async function createFailingRule() {
  const testRule = {
    id: uuidv4(),
    name: `Test Rule ${new Date().toISOString()}`,
    description: 'A rule designed to fail for testing error handling',
    triggerId: 'guest_checkin', // Use a common trigger
    triggerParams: {},
    actionId: 'test_failure',
    actionParams: {
      shouldFail: true,
      failureMessage: 'Test failure for DLQ testing',
      failureType: 'error'
    },
    schedule: 'immediate',
    delay: 0,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const { data, error } = await supabase.from('rules').insert(testRule).select();
  
  if (error) throw error;
  
  return { 
    success: true, 
    message: 'Created failing rule',
    rule: data[0]
  };
}

// Function to trigger a failing rule
async function triggerFailingRule(ruleId: string) {
  // Get the rule details
  const { data: rule, error: ruleError } = await supabase
    .from('rules')
    .select('*')
    .eq('id', ruleId)
    .single();
    
  if (ruleError) throw ruleError;
  
  // Construct parameters based on trigger type
  const parameters = { 
    guestId: `test-${uuidv4()}`,
    // Add other parameters based on the trigger type
  };
  
  // Trigger the rule via the API
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/rules/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      triggerId: rule.triggerId,
      parameters
    })
  });
  
  const result = await response.json();
  
  // Wait a moment for the action to execute and potentially fail
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: 'Triggered rule execution',
    triggerResult: result
  };
}

// Function to list DLQ items
async function listDLQ() {
  const { data, error, count } = await supabase
    .from('dead_letter_queue')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false });
    
  if (error) throw error;
  
  return {
    success: true,
    count,
    items: data
  };
}

// Function to process all DLQ items
async function processDLQ() {
  // This is a simplified implementation - in production, you'd call your actual DLQ processor
  const { data: items, error } = await supabase
    .from('dead_letter_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('retryAttempts', 3)
    .order('timestamp', { ascending: true })
    .limit(10);
    
  if (error) throw error;
  
  if (!items || items.length === 0) {
    return { processed: 0, results: [] };
  }
  
  const results = [];
  
  for (const item of items) {
    try {
      // Get the rule
      const { data: rule, error: ruleError } = await supabase
        .from('rules')
        .select('*')
        .eq('id', item.ruleId)
        .single();
        
      if (ruleError) {
        results.push({
          id: item.id,
          success: false,
          error: ruleError.message
        });
        continue;
      }
      
      // Try to execute the action
      const result = await executeActionSafely(
        item.actionId,
        item.actionParams,
        rule,
        { maxRetries: 1, isRetry: true }
      );
      
      // Update DLQ item
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
        
      results.push({
        id: item.id,
        success: true,
        result
      });
    } catch (error:     any) {
      results.push({
        id: item.id,
        success: false,
        error: error.message
      });
      
      // Update DLQ item
      await supabase
        .from('dead_letter_queue')
        .update({
          retryAttempts: item.retryAttempts + 1,
          lastProcessedAt: new Date().toISOString(),
          status: item.retryAttempts + 1 >= 3 ? 'failed' : 'pending',
          processingResult: {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', item.id);
    }
  }
  
  return {
    processed: items.length,
    results
  };
}

// Function to retry a specific DLQ item
async function retryDLQItem(itemId: string) {
  // Get the DLQ item
  const { data: item, error } = await supabase
    .from('dead_letter_queue')
    .select('*')
    .eq('id', itemId)
    .single();
    
  if (error) throw error;
  
  // Get the rule
  const { data: rule, error: ruleError } = await supabase
    .from('rules')
    .select('*')
    .eq('id', item.ruleId)
    .single();
    
  if (ruleError) throw ruleError;
  
  try {
    // Try to execute the action
    const result = await executeActionSafely(
      item.actionId,
      item.actionParams,
      rule,
      { maxRetries: 1, isRetry: true }
    );
    
    // Update DLQ item
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
      
    return {
      success: true,
      result
    };
  } catch (error: any) {
    // Update DLQ item
    await supabase
      .from('dead_letter_queue')
      .update({
        retryAttempts: item.retryAttempts + 1,
        lastProcessedAt: new Date().toISOString(),
        status: item.retryAttempts + 1 >= 3 ? 'failed' : 'pending',
        processingResult: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', item.id);
      
    throw error;
  }
}

// Function to run an end-to-end test
async function runEndToEndTest() {
  // 1. Create a failing rule
  const createResult = await createFailingRule();
  const ruleId = createResult.rule.id;
  
  // 2. Trigger the rule to fail
  const triggerResult = await triggerFailingRule(ruleId);
  
  // 3. Wait a moment for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. Check the DLQ
  const dlqBefore = await listDLQ();
  
  // Find our specific item
  const dlqItem = dlqBefore.items.find(item => item.ruleId === ruleId);
  
  if (!dlqItem) {
    throw new Error('Failed to find the rule failure in the DLQ');
  }
  
  // 5. Now fix the rule so retries will succeed
  await supabase
    .from('rules')
    .update({
      actionParams: { shouldFail: false },
      updatedAt: new Date().toISOString()
    })
    .eq('id', ruleId);
  
  // 6. Retry the DLQ item
  const retryResult = await retryDLQItem(dlqItem.id);
  
  // 7. Check the DLQ again
  const dlqAfter = await listDLQ();
  
  // 8. Find our item again - it should be marked as processed now
  const processedItem = dlqAfter.items.find(item => item.id === dlqItem.id);
  
  return {
    success: true,
    createResult,
    triggerResult,
    dlqBefore: {
      count: dlqBefore.count,
      itemFound: Boolean(dlqItem)
    },
    retryResult,
    dlqAfter: {
      count: dlqAfter.count,
      itemStatus: processedItem ? processedItem.status : 'unknown'
    },
    completedSuccessfully: processedItem && processedItem.status === 'processed'
  };
}