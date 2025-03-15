import type { NextApiRequest, NextApiResponse } from 'next';
import { parseNaturalLanguage } from '../../../lib/server/openai';
import { mapNaturalLanguageToTriggerId } from '../../../lib/triggers';
import { mapNaturalLanguageToActionId } from '../../../lib/actions';
import { ParseNaturalLanguageResponse } from '../../../types';

type ApiResponse<T> = 
  | { error: string; details?: string }
  | T;

// Handler for /api/openai/parse
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ParseNaturalLanguageResponse>>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  try {
    const { text } = req.body as { text: string };
    
    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input is required' });
    }
    
    // Parse the natural language input using OpenAI/LangChain
    const parseResult = await parseNaturalLanguage(text);
    
    // Map the parsed trigger and action to actual IDs in our system
    const triggerId = mapNaturalLanguageToTriggerId(parseResult.trigger);
    const actionId = mapNaturalLanguageToActionId(parseResult.action);
    
    // Create the complete result
    const result: ParseNaturalLanguageResponse = {
      ...parseResult,
      triggerId,
      actionId
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error parsing natural language:', error);
    return res.status(500).json({ 
      error: 'Failed to parse natural language input',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}