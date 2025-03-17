// pages/api/dead-letter-queue/[id]/retry.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../../lib/supabase';
import { processDLQItem } from '../../../../lib/deadLetterQueue';
import { logError } from '@/lib/errorhandling';
import { WorkflowError } from '@/types/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Item ID is required' });
    }
    
    // Get the DLQ item
    const { data: item, error } = await supabase
      .from('dead_letter_queue')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: `Item not found: ${error.message}` });
    }
    
    // Process the item
    const result = await processDLQItem(item);
    
    return res.status(200).json({ success: true, result });
  } catch (error) {
    const newError = error instanceof WorkflowError ? error : new WorkflowError(String(error));
    const errorId = await logError(
        newError,
      'System',
      { endpoint: 'POST /api/dead-letter-queue/[id]/retry', id: req.query.id }
    );
    
    return res.status(500).json({ 
      error: `Failed to retry item (Error ID: ${errorId})`
    });
  }
}