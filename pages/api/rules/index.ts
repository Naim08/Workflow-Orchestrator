import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';
import { Rule } from '../../../types';

type ApiResponse<T> = 
  | { data: T; error?: never }
  | { data?: never; error: string };

// Handler for /api/rules
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Rule | Rule[]>>
) {
  // GET - List all rules
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      return res.status(200).json({ data: data as Rule[] });
    } catch (error) {
      console.error('Error fetching rules:', error);
      return res.status(500).json({ error: 'Failed to fetch rules' });
    }
  }
  
  // POST - Create a new rule
  else if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        triggerId,
        triggerParams,
        actionId,
        actionParams,
        schedule,
        delay,
        conditions
      } = req.body as Partial<Rule>;
      
      // Validation
      if (!name || !triggerId || !actionId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const newRule: Rule = {
        id: uuidv4(),
        name,
        description: description || '',
        triggerId,
        triggerParams: triggerParams || {},
        actionId,
        actionParams: actionParams || {},
        schedule: schedule || 'immediate',
        delay: delay || 0,
        conditions: conditions || [],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('rules')
        .insert(newRule);
      
      if (error) throw error;
      
      // Log rule creation
      await supabase.from('logs').insert({
        id: uuidv4(),
        type: 'system',
        ruleName: name,
        message: `Rule "${name}" created`,
        details: newRule,
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json({ data: newRule });
    } catch (error) {
      console.error('Error creating rule:', error);
      return res.status(500).json({ error: 'Failed to create rule' });
    }
  }
  
  // Method not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}