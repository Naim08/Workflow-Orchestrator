import { Trigger } from '../types';

// Define available triggers for the system
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
  }
];

// Get a list of all available triggers
export function getAllTriggers(): Trigger[] {
  return triggers;
}

// Get a trigger by ID
export function getTriggerById(triggerId: string): Trigger | undefined {
  return triggers.find(trigger => trigger.id === triggerId);
}

// Get triggers by category
export function getTriggersByCategory(category: string): Trigger[] {
  return triggers.filter(trigger => trigger.category === category);
}

// Map a natural language trigger to a trigger ID
export function mapNaturalLanguageToTriggerId(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Simple mapping based on keywords
  if (lowerText.includes('check in') || lowerText.includes('checkin')) {
    return 'guest_checkin';
  }
  if (lowerText.includes('check out') || lowerText.includes('checkout')) {
    return 'guest_checkout';
  }
  if (lowerText.includes('clean')) {
    return 'cleaning_completed';
  }
  if (lowerText.includes('book') || lowerText.includes('confirm')) {
    return 'booking_confirmed';
  }
  if (lowerText.includes('message')) {
    return 'new_message';
  }
  if (lowerText.includes('schedule') || lowerText.includes('time')) {
    return 'scheduled_time';
  }
  
  // Default to the first trigger if no match found
  return triggers[0].id;
}

export default triggers;