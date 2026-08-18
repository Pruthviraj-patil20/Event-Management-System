const mongoose = require('mongoose');
const { TICKET_STATUS } = require('../config/constants');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true
    },
    ticketType: {
      type: String,
      required: true,
      default: 'Standard'
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    qrCodeData: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.CONFIRMED,
      index: true
    },
    attendeeName: {
      type: String,
      required: true
    },
    attendeeEmail: {
      type: String,
      required: true
    },
    seatNumber: {
      type: String,
      default: ''
    },
    checkedInAt: {
      type: Date
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
