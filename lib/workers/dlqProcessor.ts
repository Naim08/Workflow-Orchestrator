import { processDLQBatch } from '../deadLetterQueue';
import { logError } from '../errorhandling';

/**
 * Scheduled worker to process the dead letter queue
 */
export async function processDeadLetterQueue(): Promise<{ processed: number }> {
  try {
    console.log('Starting dead letter queue processing...');
    
    // Process a batch of items
    const result = await processDLQBatch(20, { olderThanMinutes: 5 });
    
    console.log(`Processed ${result.processed} items from the dead letter queue`);
    
    // Return the results
    return result;
  } catch (error: any) {
    await logError(
      error.message,
      'System',
      { worker: 'DLQ Processor' }
    );
    
    console.error('Error processing dead letter queue:', error);
    throw error;
  }
}