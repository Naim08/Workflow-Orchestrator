import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';
import { Log } from '../../../types';

type ApiResponse<T> = 
  | { data: T; error?: never }
  | { data?: never; error: string };

// Handler for /api/logs
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Log[]>>
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  try {
    const { 
      filter = 'all', 
      page = '1', 
      limit = '20' 
    } = req.query;
    
    // Parse and validate query parameters
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    
    // Calculate offset for pagination
    const offset = (pageNum - 1) * limitNum;
    
    // Start building the query
    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limitNum)
      .range(offset, offset + limitNum - 1);
    
    // Apply type filter if needed
    if (filter !== 'all') {
      query = query.eq('type', filter);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) throw error;
    
    return res.status(200).json({ data: data as Log[] });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}