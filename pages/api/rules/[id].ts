import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';
import { Rule } from '../../../types';

type ApiResponse<T> = 
  | { data: T; error?: never }
  | { data?: never; error: string }
  | { success: boolean; error?: never };

// Handler for /api/rules/[id]
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Rule>>
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Rule ID is required' });
  }
  
  // GET - Get a rule by ID
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Rule not found' });
        }
        throw error;
      }
      
      return res.status(200).json({ data: data as Rule });
    } catch (error) {
      console.error('Error fetching rule:', error);
      return res.status(500).json({ error: 'Failed to fetch rule' });
    }
  }
  
  // PUT - Update a rule
  else if (req.method === 'PUT') {
    try {
      const updates = req.body as Partial<Rule>;
      
      // Add updatedAt timestamp
      updates.updatedAt = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Rule not found' });
        }
        throw error;
      }
      
      // Log rule update
      await supabase.from('logs').insert({
        id: uuidv4(),
        type: 'system',
        ruleName: data.name,
        message: `Rule "${data.name}" updated`,
        details: { id, updates },
        timestamp: new Date().toISOString()
      });
      
      return res.status(200).json({ data: data as Rule });
    } catch (error) {
      console.error('Error updating rule:', error);
      return res.status(500).json({ error: 'Failed to update rule' });
    }
  }
  
  // DELETE - Delete a rule
  else if (req.method === 'DELETE') {
    try {
      // First, get the rule to log its name
      const { data: rule, error: fetchError } = await supabase
        .from('rules')
        .select('name')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Rule not found' });
        }
        throw fetchError;
      }
      
      // Then delete the rule
      const { error: deleteError } = await supabase
        .from('rules')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Log rule deletion
      await supabase.from('logs').insert({
        id: uuidv4(),
        type: 'system',
        ruleName: rule.name,
        message: `Rule "${rule.name}" deleted`,
        details: { id },
        timestamp: new Date().toISOString()
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting rule:', error);
      return res.status(500).json({ error: 'Failed to delete rule' });
    }
  }
  
  // Method not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}