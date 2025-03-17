import { NextApiRequest, NextApiResponse } from 'next';
import { processDeadLetterQueue } from '../../../lib/workers/dlqProcessor';
import { logError } from '../../../lib/errorhandling';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method with a secret key for security
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  
  // Check for a secret key to prevent unauthorized access
  const { secret } = req.body;
  const expectedSecret = process.env.WORKER_SECRET || 'default-secret-change-me';
  
  if (secret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const result = await processDeadLetterQueue();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    const newError = error instanceof Error ? error : new Error(String(error));
    const errorId = await logError(
        newError,
      'System',
      { worker: 'DLQ Processor API' }
    );
    
    return res.status(500).json({ 
      error: `Worker failed (Error ID: ${errorId})`
    });
  }
}