// lib/actions-hospitality.ts
import { Action } from '../types';

const hospitalityActions: Action[] = [
  {
    id: 'send_welcome_email',
    name: 'Send welcome email',
    description: 'Sends a welcome email to the guest',
    category: 'communication',
    parameters: [
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      },
      {
        name: 'templateId',
        type: 'string',
        required: false,
        description: 'ID of the email template to use',
        default: 'default_welcome'
      },
      {
        name: 'includeLocalInfo',
        type: 'boolean',
        required: false,
        description: 'Whether to include local information in the email',
        default: true
      },
      {
        name: 'ccManagerEmail',
        type: 'boolean',
        required: false,
        description: 'Whether to CC the property manager',
        default: false
      }
    ]
  },
  {
    id: 'notify_cleaning_staff',
    name: 'Notify cleaning staff',
    description: 'Notifies the cleaning staff about a room that needs attention',
    category: 'staff',
    parameters: [
      {
        name: 'roomId',
        type: 'string',
        required: true,
        description: 'ID of the room that needs cleaning'
      },
      {
        name: 'priority',
        type: 'string',
        required: false,
        description: 'Priority level (normal, high, urgent)',
        default: 'normal'
      },
      {
        name: 'notes',
        type: 'string',
        required: false,
        description: 'Additional notes for the cleaning staff',
        default: ''
      },
      {
        name: 'requestedBy',
        type: 'string',
        required: false,
        description: 'ID of the person who requested cleaning',
        default: 'system'
      }
    ]
  },
  {
    id: 'notify_front_desk',
    name: 'Notify front desk',
    description: 'Sends a notification to the front desk staff',
    category: 'staff',
    parameters: [
      {
        name: 'message',
        type: 'string',
        required: true,
        description: 'Message to send to the front desk'
      },
      {
        name: 'category',
        type: 'string',
        required: false,
        description: 'Category of the notification',
        default: 'general'
      },
      {
        name: 'priority',
        type: 'string',
        required: false,
        description: 'Priority level (low, normal, high)',
        default: 'normal'
      },
      {
        name: 'relatedEntityId',
        type: 'string',
        required: false,
        description: 'ID of the related entity (room, guest, etc.)',
        default: ''
      },
      {
        name: 'requiresAction',
        type: 'boolean',
        required: false,
        description: 'Whether the notification requires action',
        default: false
      }
    ]
  },
  {
    id: 'send_thank_you_email',
    name: 'Send thank-you email with promo code',
    description: 'Sends a thank-you email with a promotional code to a guest',
    category: 'communication',
    parameters: [
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      },
      {
        name: 'promoCode',
        type: 'string',
        required: false,
        description: 'Promotion code to include',
        default: 'THANKYOU10'
      },
      {
        name: 'promoDiscount',
        type: 'number',
        required: false,
        description: 'Discount percentage or amount',
        default: 10
      },
      {
        name: 'expiryDays',
        type: 'number',
        required: false,
        description: 'Number of days until promo code expires',
        default: 90
      },
      {
        name: 'templateId',
        type: 'string',
        required: false,
        description: 'ID of the email template to use',
        default: 'thank_you_promo'
      }
    ]
  },
  {
    id: 'notify_maintenance_team',
    name: 'Notify maintenance team',
    description: 'Notifies the maintenance team about an issue that needs attention',
    category: 'staff',
    parameters: [
      {
        name: 'issueType',
        type: 'string',
        required: true,
        description: 'Type of issue (plumbing, electrical, etc.)'
      },
      {
        name: 'locationId',
        type: 'string',
        required: true,
        description: 'ID of the location (room, common area, etc.)'
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        description: 'Description of the issue'
      },
      {
        name: 'priority',
        type: 'string',
        required: false,
        description: 'Priority level (low, medium, high, critical)',
        default: 'medium'
      },
      {
        name: 'photosUrls',
        type: 'array',
        required: false,
        description: 'Array of photo URLs showing the issue',
        default: []
      },
      {
        name: 'requestedBy',
        type: 'string',
        required: false,
        description: 'ID of the person reporting the issue',
        default: 'system'
      }
    ]
  },
  {
    id: 'send_guest_notification',
    name: 'Send notification to guest',
    description: 'Sends a notification to a guest through the preferred channel',
    category: 'communication',
    parameters: [
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      },
      {
        name: 'message',
        type: 'string',
        required: true,
        description: 'Message to send to the guest'
      },
      {
        name: 'channel',
        type: 'string',
        required: false,
        description: 'Communication channel (email, sms, app)',
        default: 'app'
      },
      {
        name: 'priority',
        type: 'string',
        required: false,
        description: 'Priority level (normal, important, urgent)',
        default: 'normal'
      },
      {
        name: 'requiresResponse',
        type: 'boolean',
        required: false,
        description: 'Whether the notification requires a response',
        default: false
      }
    ]
  },
  {
    id: 'create_maintenance_task',
    name: 'Create maintenance task',
    description: 'Creates a new maintenance task in the system',
    category: 'maintenance',
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Title of the maintenance task'
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        description: 'Description of the task'
      },
      {
        name: 'locationId',
        type: 'string',
        required: true,
        description: 'ID of the location (room, common area, etc.)'
      },
      {
        name: 'priority',
        type: 'string',
        required: false,
        description: 'Priority level (low, medium, high, urgent)',
        default: 'medium'
      },
      {
        name: 'dueDate',
        type: 'datetime',
        required: false,
        description: 'Due date for the task',
        default: null
      },
      {
        name: 'assigneeId',
        type: 'string',
        required: false,
        description: 'ID of the staff member to assign the task to',
        default: null
      }
    ]
  },
  {
    id: 'offer_room_upgrade',
    name: 'Offer room upgrade',
    description: 'Offers a room upgrade to a guest at a special rate',
    category: 'revenue',
    parameters: [
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      },
      {
        name: 'bookingId',
        type: 'string',
        required: true,
        description: 'ID of the booking'
      },
      {
        name: 'currentRoomType',
        type: 'string',
        required: true,
        description: 'Current room type'
      },
      {
        name: 'upgradeRoomType',
        type: 'string',
        required: true,
        description: 'Upgraded room type to offer'
      },
      {
        name: 'upgradePrice',
        type: 'number',
        required: true,
        description: 'Price for the upgrade'
      },
      {
        name: 'currency',
        type: 'string',
        required: false,
        description: 'Currency for the upgrade price',
        default: 'USD'
      },
      {
        name: 'offerExpiryHours',
        type: 'number',
        required: false,
        description: 'Hours until the offer expires',
        default: 24
      }
    ]
  },
  {
    id: 'update_booking',
    name: 'Update booking details',
    description: 'Updates the details of an existing booking',
    category: 'booking',
    parameters: [
      {
        name: 'bookingId',
        type: 'string',
        required: true,
        description: 'ID of the booking to update'
      },
      {
        name: 'checkInDate',
        type: 'datetime',
        required: false,
        description: 'New check-in date and time',
        default: null
      },
      {
        name: 'checkOutDate',
        type: 'datetime',
        required: false,
        description: 'New check-out date and time',
        default: null
      },
      {
        name: 'roomType',
        type: 'string',
        required: false,
        description: 'New room type',
        default: null
      },
      {
        name: 'guestCount',
        type: 'number',
        required: false,
        description: 'New number of guests',
        default: null
      },
      {
        name: 'specialRequests',
        type: 'string',
        required: false,
        description: 'Updated special requests',
        default: null
      },
      {
        name: 'notifyGuest',
        type: 'boolean',
        required: false,
        description: 'Whether to notify the guest about the changes',
        default: true
      }
    ]
  },
  {
    id: 'send_checkout_reminder',
    name: 'Send checkout reminder',
    description: 'Sends a checkout reminder to a guest',
    category: 'communication',
    parameters: [
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      },
      {
        name: 'bookingId',
        type: 'string',
        required: true,
        description: 'ID of the booking'
      },
      {
        name: 'checkoutTime',
        type: 'string',
        required: true,
        description: 'Checkout time (e.g., "11:00 AM")'
      },
      {
        name: 'includeFeedbackForm',
        type: 'boolean',
        required: false,
        description: 'Whether to include a feedback form',
        default: true
      },
      {
        name: 'includeLateLateCheckoutOffer',
        type: 'boolean',
        required: false,
        description: 'Whether to include a late checkout offer',
        default: false
      },
      {
        name: 'lateCheckoutFee',
        type: 'number',
        required: false,
        description: 'Fee for late checkout if offered',
        default: 0
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
  }
];

export default hospitalityActions;