import type { NextApiRequest, NextApiResponse } from 'next';
import { generateRuleDescription } from '../../../lib/langchain';
import { Rule } from '../../../types';

type ApiResponse<T> = 
  | { error: string; details?: string }
  | T;

interface DescriptionResponse {
  description: string;
}

// Handler for /api/openai/generate-description
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DescriptionResponse>>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  try {
    const rule = req.body as Rule;
    
    // Validation
    if (!rule || !rule.triggerId || !rule.actionId) {
      return res.status(400).json({ error: 'Valid rule data is required' });
    }
    
    // Generate a description using LangChain
    const description = await generateRuleDescription(rule);
    
    return res.status(200).json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    return res.status(500).json({ 
      error: 'Failed to generate rule description', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}