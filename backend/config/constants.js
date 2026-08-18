module.exports = {
  ROLES: {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    ATTENDEE: 'attendee'
  },
  EVENT_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    PUBLISHED: 'published',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  },
  EVENT_CATEGORIES: [
    'Technology',
    'Music',
    'Business',
    'Sports',
    'Education',
    'Workshop',
    'Conference',
    'Festival'
  ],
  TICKET_STATUS: {
    CONFIRMED: 'confirmed',
    USED: 'used',
    CANCELLED: 'cancelled',
    PENDING: 'pending'
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },
  NOTIFICATION_TYPES: {
    REGISTRATION: 'registration',
    EVENT_UPDATE: 'event_update',
    TICKET_CONFIRMED: 'ticket_confirmed',
    EVENT_APPROVAL: 'event_approval',
    EVENT_REJECTION: 'event_rejection',
    REMINDER: 'reminder',
    SYSTEM: 'system'
  }
};
