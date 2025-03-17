// pages/api/test/add-dlq-entry.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  try {
    const entry = {
      id: uuidv4(),
      ruleId: req.body.ruleId || 'e5dc25d2-7239-4e8d-9f08-0568410e0b5c',
      ruleName: req.body.ruleName || 'Test Rule',
      triggerId: req.body.triggerId || 'test_trigger',
      actionId: req.body.actionId || 'test_action',
      actionParams: req.body.actionParams || {},
      context: req.body.context || {},
      error: req.body.error || 'Test error',
      stackTrace: req.body.stackTrace || 'Test stack trace',
      timestamp: new Date().toISOString(),
      retryAttempts: 0,
      status: 'pending',
      lastProcessedAt: null
    };
    
    const { data, error } = await supabase
      .from('dead_letter_queue')
      .insert(entry);
      
    if (error) throw error;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Added test entry to DLQ',
      entry
    });
  } catch (error) {
    console.error('Error adding test DLQ entry:', error);
    return res.status(500).json({ 
      error: 'Failed to add test DLQ entry',
      details: error
    });
  }
}