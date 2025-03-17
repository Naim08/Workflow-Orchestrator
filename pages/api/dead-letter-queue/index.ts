// pages/api/dead-letter-queue/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';
import { processDLQBatch, processDLQItem } from '../../../lib/deadLetterQueue';
import { logError } from '@/lib/errorhandling';
import { WorkflowError } from '@/types/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET - List items in the dead letter queue
  if (req.method === 'GET') {
    try {
      const { 
        status = 'pending', 
        limit = 50, 
        offset = 0,
        order = 'timestamp.desc'
      } = req.query;
      
      // Parse order parameter
      const [orderField, orderDirection] = (order as string).split('.');
      
      // Build the query
      const query = supabase
        .from('dead_letter_queue')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (status && status !== 'all') {
        query.eq('status', status);
      }
      
      // Apply ordering
      query.order(orderField, { ascending: orderDirection === 'asc' });
      
      // Apply pagination
      query.range(
        Number(offset), 
        Number(offset) + Number(limit) - 1
      );
      
      const { data, count, error } = await query;
      
      if (error) throw error;
      
      return res.status(200).json({ 
        data,
        count,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: count
        }
      });
    } catch (error) {
        const newError = error instanceof WorkflowError ? error : new WorkflowError(String(error));
      const errorId = await logError(
        newError,
        'System',
        { endpoint: 'GET /api/dead-letter-queue', query: req.query }
      );
      
      return res.status(500).json({ 
        error: `Failed to fetch dead letter queue items (Error ID: ${errorId})`
      });
    }
  }
  
  // POST - Process items from the dead letter queue
  else if (req.method === 'POST') {
    try {
      const { 
        items, 
        processAll = false,
        limit = 10,
        olderThanMinutes = 5
      } = req.body;
      
      if (items && Array.isArray(items) && items.length > 0) {
        // Process specific items
        const results = [];
        
        for (const itemId of items) {
          // Get the item
          const { data: item, error } = await supabase
            .from('dead_letter_queue')
            .select('*')
            .eq('id', itemId)
            .single();
            
          if (error) {
            results.push({
              id: itemId,
              success: false,
              error: error.message
            });
            continue;
          }
          
          // Process the item
          const result = await processDLQItem(item);
          results.push({
            id: itemId,
            ruleName: item.ruleName,
            result
          });
        }
        
        return res.status(200).json({ results });
      } else if (processAll) {
        // Process a batch of items
        const result = await processDLQBatch(limit, { olderThanMinutes });
        return res.status(200).json(result);
      } else {
        return res.status(400).json({ 
          error: 'You must specify either items to process or set processAll to true' 
        });
      }
    } catch (error) {
        const newError = error instanceof WorkflowError ? error : new WorkflowError(String(error));
      const errorId = await logError(
        newError,
        'System',
        { endpoint: 'POST /api/dead-letter-queue', body: req.body }
      );
      
      return res.status(500).json({ 
        error: `Failed to process dead letter queue items (Error ID: ${errorId})`
      });
    }
  }
  
  // DELETE - Clear items from the dead letter queue
  else if (req.method === 'DELETE') {
    try {
      const { status, olderThan, ids } = req.body;
      
      let query = supabase.from('dead_letter_queue');
      
      if (ids && Array.isArray(ids) && ids.length > 0) {
        // Type assertion to tell TypeScript these methods exist
        query = (query as any).in('id', ids);
      } else if (status) {
        query = (query as any).eq('status', status);
        
        if (olderThan) {
          const cutoffTime = new Date();
          cutoffTime.setDate(cutoffTime.getDate() - olderThan);
          query = (query as any).lt('timestamp', cutoffTime.toISOString());
        }
      } else {
        return res.status(400).json({
          error: 'You must specify either ids to delete or a status filter'
        });
      }
      
      const { data, error, count } = await query.delete({ count: 'exact' });
      
      if (error) throw error;
      
      return res.status(200).json({ 
        success: true, 
        deleted: count 
      });
    } catch (error) {
    
      const newError = error instanceof WorkflowError ? error : new WorkflowError(String(error));
      const errorId = await logError(
        newError,
        'System',
        { endpoint: 'DELETE /api/dead-letter-queue', body: req.body }
      );
      
      return res.status(500).json({ 
        error: `Failed to delete dead letter queue items (Error ID: ${errorId})`
      });
    }
  }
  
  // Method not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}