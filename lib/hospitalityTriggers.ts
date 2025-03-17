import { Trigger } from '../types';

const hospitalityTriggers: Trigger[] = [
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
      },
      {
        name: 'roomId',
        type: 'string',
        required: true,
        description: 'ID of the assigned room'
      },
      {
        name: 'checkInTime',
        type: 'datetime',
        required: true,
        description: 'Time when the guest checked in'
      },
      {
        name: 'isVip',
        type: 'boolean',
        required: false,
        description: 'Whether the guest is a VIP',
        default: false
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
      },
      {
        name: 'roomId',
        type: 'string',
        required: true,
        description: 'ID of the vacated room'
      },
      {
        name: 'checkOutTime',
        type: 'datetime',
        required: true,
        description: 'Time when the guest checked out'
      }
    ]
  },
  {
    id: 'cleaning_completed',
    name: 'Cleaning task completed',
    description: 'Triggered when a cleaning task is marked as complete',
    category: 'maintenance',
    parameters: [
      {
        name: 'taskId',
        type: 'string',
        required: true,
        description: 'ID of the cleaning task'
      },
      {
        name: 'roomId',
        type: 'string',
        required: true,
        description: 'ID of the cleaned room'
      },
      {
        name: 'completedBy',
        type: 'string',
        required: true,
        description: 'ID of the staff member who completed the cleaning'
      },
      {
        name: 'completionTime',
        type: 'datetime',
        required: true,
        description: 'Time when the cleaning was completed'
      },
      {
        name: 'notes',
        type: 'string',
        required: false,
        description: 'Any notes from the cleaning staff',
        default: ''
      }
    ]
  },
  {
    id: 'guest_review_submitted',
    name: 'Guest leaves a review',
    description: 'Triggered when a guest submits a review for their stay',
    category: 'guest',
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
        name: 'rating',
        type: 'number',
        required: true,
        description: 'Rating given by the guest (1-5)'
      },
      {
        name: 'reviewText',
        type: 'string',
        required: false,
        description: 'Text content of the review',
        default: ''
      }
    ]
  },
  {
    id: 'device_alert',
    name: 'Smart device alert',
    description: 'Triggered when a smart device reports an issue or alert',
    category: 'maintenance',
    parameters: [
      {
        name: 'deviceId',
        type: 'string',
        required: true,
        description: 'ID of the device'
      },
      {
        name: 'deviceType',
        type: 'string',
        required: true,
        description: 'Type of device (lock, thermostat, etc.)'
      },
      {
        name: 'alertType',
        type: 'string',
        required: true,
        description: 'Type of alert (battery low, offline, malfunction)'
      },
      {
        name: 'roomId',
        type: 'string',
        required: false,
        description: 'ID of the room where the device is located',
        default: ''
      },
      {
        name: 'batteryLevel',
        type: 'number',
        required: false,
        description: 'Current battery level (if applicable)',
        default: null
      }
    ]
  },
  {
    id: 'noise_threshold_exceeded',
    name: 'Noise level exceeds threshold',
    description: 'Triggered when noise sensors detect levels above the allowed threshold',
    category: 'security',
    parameters: [
      {
        name: 'roomId',
        type: 'string',
        required: true,
        description: 'ID of the room where noise was detected'
      },
      {
        name: 'noiseLevel',
        type: 'number',
        required: true,
        description: 'Measured noise level in decibels'
      },
      {
        name: 'timestamp',
        type: 'datetime',
        required: true,
        description: 'Time when the noise was detected'
      },
      {
        name: 'duration',
        type: 'number',
        required: false,
        description: 'Duration of the noise in seconds',
        default: 0
      }
    ]
  },
  {
    id: 'payment_failed',
    name: 'Payment failed',
    description: 'Triggered when a payment attempt fails',
    category: 'billing',
    parameters: [
      {
        name: 'bookingId',
        type: 'string',
        required: true,
        description: 'ID of the booking'
      },
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      },
      {
        name: 'amount',
        type: 'number',
        required: true,
        description: 'Amount that failed to charge'
      },
      {
        name: 'currency',
        type: 'string',
        required: true,
        description: 'Currency of the amount',
        default: 'USD'
      },
      {
        name: 'failureReason',
        type: 'string',
        required: false,
        description: 'Reason for the payment failure',
        default: ''
      }
    ]
  },
  {
    id: 'occupancy_rate_changed',
    name: 'Occupancy rate changed',
    description: 'Triggered when the property occupancy rate crosses a threshold',
    category: 'business',
    parameters: [
      {
        name: 'propertyId',
        type: 'string',
        required: true,
        description: 'ID of the property'
      },
      {
        name: 'currentRate',
        type: 'number',
        required: true,
        description: 'Current occupancy rate as a percentage'
      },
      {
        name: 'previousRate',
        type: 'number',
        required: true,
        description: 'Previous occupancy rate as a percentage'
      },
      {
        name: 'periodStart',
        type: 'datetime',
        required: true,
        description: 'Start of the period being measured'
      },
      {
        name: 'periodEnd',
        type: 'datetime',
        required: true,
        description: 'End of the period being measured'
      }
    ]
  },
  {
    id: 'new_reservation',
    name: 'New reservation booked',
    description: 'Triggered when a new reservation is created',
    category: 'booking',
    parameters: [
      {
        name: 'bookingId',
        type: 'string',
        required: true,
        description: 'ID of the booking'
      },
      {
        name: 'guestId',
        type: 'string',
        required: true,
        description: 'ID of the guest'
      },
      {
        name: 'checkInDate',
        type: 'datetime',
        required: true,
        description: 'Check-in date and time'
      },
      {
        name: 'checkOutDate',
        type: 'datetime',
        required: true,
        description: 'Check-out date and time'
      },
      {
        name: 'roomType',
        type: 'string',
        required: true,
        description: 'Type of room booked'
      },
      {
        name: 'guestCount',
        type: 'number',
        required: true,
        description: 'Number of guests'
      }
    ]
  },
  {
    id: 'maintenance_request',
    name: 'Maintenance request created',
    description: 'Triggered when a maintenance request is submitted',
    category: 'maintenance',
    parameters: [
      {
        name: 'requestId',
        type: 'string',
        required: true,
        description: 'ID of the maintenance request'
      },
      {
        name: 'roomId',
        type: 'string',
        required: true,
        description: 'ID of the room requiring maintenance'
      },
      {
        name: 'requestType',
        type: 'string',
        required: true,
        description: 'Type of maintenance request'
      },
      {
        name: 'priority',
        type: 'string',
        required: true,
        description: 'Priority level (low, medium, high, urgent)',
        default: 'medium'
      },
      {
        name: 'description',
        type: 'string',
        required: true,
        description: 'Description of the issue'
      },
      {
        name: 'reportedBy',
        type: 'string',
        required: false,
        description: 'ID of the person who reported the issue',
        default: ''
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
      }
    ]
  }
];

export default hospitalityTriggers;