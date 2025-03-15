// lib/openai.ts

import { LangChainParseResult } from '../types';

// This file is safe to import in both client and server components

/**
 * Checks if the OpenAI API key exists by calling the API
 * @returns A promise that resolves to a boolean indicating if the key exists
 */
export async function checkApiKeyExists(): Promise<boolean> {
  try {
    const response = await fetch('/api/settings/apiKey');
    const data = await response.json();
    return data.hasKey;
  } catch (error) {
    console.error('Error checking API key status:', error);
    return false;
  }
}

/**
 * Saves the OpenAI API key by calling the API
 * @param apiKey The API key to save
 * @returns A promise that resolves to a boolean indicating if the save was successful
 */
export async function saveApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('/api/settings/apiKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
}

/**
 * Parses natural language into a structured rule by calling the API
 * @param text The natural language description of the rule
 * @returns A promise that resolves to a structured rule object
 */
export async function parseRule(text: string): Promise<LangChainParseResult> {
  const response = await fetch('/api/openai/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse natural language input');
  }
  
  return response.json();
}