const mongoose = require('mongoose');
const { EVENT_STATUS, EVENT_CATEGORIES } = require('../config/constants');

const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    enum: ['Standard', 'VIP', 'Premium', 'Early Bird', 'General Admission', 'Student Pass'],
    default: 'Standard'
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 100
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  description: {
    type: String,
    default: ''
  },
  perks: [
    {
      type: String
    }
  ]
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    shortDescription: {
      type: String,
      maxlength: [240, 'Short description cannot exceed 240 characters'],
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: EVENT_CATEGORIES,
      index: true
    },
    eventType: {
      type: String,
      enum: ['In-Person', 'Online', 'Hybrid'],
      default: 'In-Person',
      index: true
    },
    meetingLink: {
      type: String,
      default: ''
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
      index: true
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [function() { return this.eventType !== 'Online'; }, 'Venue is required for In-Person or Hybrid events']
    },
    venueDetails: {
      name: String,
      address: String,
      city: String,
      state: String
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
    },
    gallery: [
      {
        type: String
      }
    ],
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      default: '10:00 AM'
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      default: '05:00 PM'
    },
    capacity: {
      type: Number,
      required: [true, 'Total event capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0
    },
    ticketTypes: [ticketTypeSchema],
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.PUBLISHED,
      index: true
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    averageRating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance search & filtering
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, date: 1, status: 1 });
eventSchema.index({ 'venueDetails.city': 1 });
eventSchema.index({ 'venueDetails.state': 1 });

module.exports = mongoose.model('Event', eventSchema);
