import type { NextApiRequest, NextApiResponse } from 'next';
import { getOpenAIApiKey, saveOpenAIApiKey } from '../../../lib/server/openai';

type ApiResponse<T> = 
  | { error: string }
  | T;

interface ApiKeyStatusResponse {
  hasKey: boolean;
}

interface ApiKeySaveResponse {
  success: boolean;
}

// Handler for /api/settings/apiKey
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ApiKeyStatusResponse | ApiKeySaveResponse>>
) {
  // GET - Check if API key exists
  if (req.method === 'GET') {
    try {
      const apiKey = getOpenAIApiKey();
      
      // Don't return the actual key, just whether it exists
      return res.status(200).json({
        hasKey: Boolean(apiKey)
      });
    } catch (error) {
      console.error('Error checking API key:', error);
      return res.status(500).json({ error: 'Failed to check API key status' });
    }
  }
  
  // POST - Save API key
  else if (req.method === 'POST') {
    try {
      const { apiKey } = req.body as { apiKey: string };
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ error: 'Valid API key is required' });
      }
      
      // Simple validation that it looks like an OpenAI key
      if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
        return res.status(400).json({ error: 'Invalid API key format' });
      }
      
      const success = saveOpenAIApiKey(apiKey);
      
      if (!success) {
        throw new Error('Failed to save API key');
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving API key:', error);
      return res.status(500).json({ error: 'Failed to save API key' });
    }
  }
  
  // Method not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}