import { Trigger } from '../types';
import hospitalityTriggers from './hospitalityTriggers';

const triggers: Trigger[] = [
  {
    id: 'guest_checkin',
    name: 'Guest checks in',
    description: 'Triggered when a guest checks into the property',
    category: 'guest',
    parameters: [
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      }
    ]
  },
  {
    id: 'cleaning_completed',
    name: 'Cleaning completed',
    description: 'Triggered when a cleaning service completes cleaning a property',
    category: 'property',
    parameters: [
      {
        name: 'propertyId',
        type: 'string',
        required: true,
        description: 'ID of the property'
      }
    ]
  },
  {
    id: 'booking_confirmed',
    name: 'Booking confirmed',
    description: 'Triggered when a booking is confirmed',
    category: 'booking',
    parameters: [
      {
        name: 'bookingId',
        type: 'string',
        required: true,
        description: 'ID of the booking'
      }
    ]
  },
  {
    id: 'guest_checkout',
    name: 'Guest checks out',
    description: 'Triggered when a guest checks out of the property',
    category: 'guest',
    parameters: [
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      }
    ]
  },
  {
    id: 'new_message',
    name: 'New message received',
    description: 'Triggered when a new message is received',
    category: 'communication',
    parameters: [
      {
        name: 'messageId',
        type: 'string',
        required: true,
        description: 'ID of the message'
      }
    ]
  },
  {
    id: 'scheduled_time',
    name: 'Scheduled time reached',
    description: 'Triggered at a specific time',
    category: 'time',
    parameters: [
      {
        name: 'time',
        type: 'datetime',
        required: true,
        description: 'The scheduled time'
      }
    ]
  },
  {
    id: 'test_failure',
    name: 'Test Failure Action',
    description: 'An action that fails on purpose for testing error handling',
    category: 'testing',
    parameters: [
      {
        name: 'shouldFail',
        type: 'boolean',
        required: false,
        description: 'Whether this action should fail',
        default: true
      },
      {
        name: 'failureMessage',
        type: 'string',
        required: false,
        description: 'Custom failure message',
        default: 'Intentional test failure'
      },
      {
        name: 'failureType',
        type: 'string',
        required: false,
        description: 'Type of failure to simulate',
        default: 'error' // Options: error, timeout, intermittent
      }
    ]
  },
  

  ...hospitalityTriggers
];

const mergedTriggers = triggers.reduce((acc, trigger) => {
  const index = acc.findIndex(t => t.id === trigger.id);
  if (index >= 0) {
    // Replace with newer version if duplicate found
    acc[index] = trigger;
  } else {
    // Add new trigger if no duplicate
    acc.push(trigger);
  }
  return acc;
}, [] as Trigger[]);

// Get a list of all available triggers
export function getAllTriggers(): Trigger[] {
  return mergedTriggers;
}

// Get a trigger by ID
export function getTriggerById(triggerId: string): Trigger | undefined {
  return mergedTriggers.find(trigger => trigger.id === triggerId);
}

// Get triggers by category
export function getTriggersByCategory(category: string): Trigger[] {
  return mergedTriggers.filter(trigger => trigger.category === category);
}

// Map a natural language trigger to a trigger ID
export function mapNaturalLanguageToTriggerId(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Simple mapping based on keywords - expanded for hospitality
  if (lowerText.includes('check in') || lowerText.includes('checkin')) {
    return 'guest_checkin';
  }
  if (lowerText.includes('check out') || lowerText.includes('checkout')) {
    return 'guest_checkout';
  }
  if (lowerText.includes('clean')) {
    return 'cleaning_completed';
  }
  if (lowerText.includes('book') || lowerText.includes('confirm') || lowerText.includes('reservation')) {
    return 'new_reservation';
  }
  if (lowerText.includes('message')) {
    return 'new_message';
  }
  if (lowerText.includes('schedule') || lowerText.includes('time')) {
    return 'scheduled_time';
  }
  if (lowerText.includes('review')) {
    return 'guest_review_submitted';
  }
  if (lowerText.includes('noise')) {
    return 'noise_threshold_exceeded';
  }
  if (lowerText.includes('payment') && (lowerText.includes('fail') || lowerText.includes('decline'))) {
    return 'payment_failed';
  }
  if (lowerText.includes('maintenance') || lowerText.includes('repair')) {
    return 'maintenance_request';
  }
  if (lowerText.includes('device') || lowerText.includes('smart') || lowerText.includes('battery')) {
    return 'device_alert';
  }
  if (lowerText.includes('occupancy')) {
    return 'occupancy_rate_changed';
  }
  
  // Default to the first trigger if no match found
  return mergedTriggers[0].id;
}

export default mergedTriggers;