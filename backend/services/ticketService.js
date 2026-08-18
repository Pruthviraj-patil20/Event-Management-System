const Ticket = require('../models/Ticket');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const { generateTicketNumber, generateRegistrationNumber, generateTransactionId } = require('../utils/generateTicket');
const { generateQRCode } = require('../utils/generateQRCode');
const NotificationService = require('./notificationService');
const EmailService = require('./emailService');
const { TICKET_STATUS, PAYMENT_STATUS, NOTIFICATION_TYPES } = require('../config/constants');

class TicketService {
  /**
   * Process booking / ticket purchase
   */
  static async purchaseTickets({ user, eventId, items, attendeeInfo, paymentMethod = 'Card' }) {
    const event = await Event.findById(eventId).populate('venue').populate('organizer');
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'published') {
      throw new Error('This event is not open for registration');
    }

    // Calculate total seats requested and total price
    let totalSeatsRequested = 0;
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const ticketTier = event.ticketTypes.find(t => t.name === item.ticketType || t._id.toString() === item.ticketType);
      if (!ticketTier) {
        throw new Error(`Ticket tier "${item.ticketType}" does not exist for this event`);
      }

      if (ticketTier.availableQuantity < item.quantity) {
        throw new Error(`Only ${ticketTier.availableQuantity} seats remaining for ${ticketTier.name}`);
      }

      const qty = parseInt(item.quantity, 10);
      const subtotal = ticketTier.price * qty;
      totalSeatsRequested += qty;
      totalAmount += subtotal;

      processedItems.push({
        ticketType: ticketTier.name,
        price: ticketTier.price,
        quantity: qty,
        subtotal
      });

      // Decrement ticket tier stock
      ticketTier.availableQuantity -= qty;
    }

    if (event.availableSeats < totalSeatsRequested) {
      throw new Error('Not enough total event capacity available.');
    }

    // Decrement total available seats
    event.availableSeats -= totalSeatsRequested;
    await event.save();

    // Create Registration Record
    const registrationNumber = generateRegistrationNumber();
    const registration = await Registration.create({
      registrationNumber,
      user: user._id,
      event: event._id,
      attendeeInfo: {
        name: attendeeInfo?.name || user.name,
        email: attendeeInfo?.email || user.email,
        phone: attendeeInfo?.phone || user.phone || ''
      },
      items: processedItems,
      totalAmount,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
      paymentMethod,
      paymentId: generateTransactionId()
    });

    // Create Payment Record
    const payment = await Payment.create({
      transactionId: registration.paymentId,
      user: user._id,
      event: event._id,
      registration: registration._id,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod,
      status: PAYMENT_STATUS.COMPLETED
    });

    // Generate individual Tickets with QR Codes
    const createdTickets = [];
    for (const item of processedItems) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketNumber = generateTicketNumber();
        const qrPayload = {
          t: ticketNumber,
          e: event._id.toString(),
          u: user._id.toString(),
          n: attendeeInfo?.name || user.name,
          k: item.ticketType,
          v: event.venueDetails?.name || (event.venue && event.venue.name) || 'Main Venue',
          d: event.date
        };

        const qrCodeData = await generateQRCode(qrPayload);

        const ticket = await Ticket.create({
          ticketNumber,
          event: event._id,
          user: user._id,
          registration: registration._id,
          ticketType: item.ticketType,
          price: item.price,
          qrCodeData,
          status: TICKET_STATUS.CONFIRMED,
          attendeeName: attendeeInfo?.name || user.name,
          attendeeEmail: attendeeInfo?.email || user.email,
          seatNumber: `${item.ticketType.substring(0, 1).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
        });

        createdTickets.push(ticket);
      }
    }

    // Dispatch in-app notification
    await NotificationService.sendNotification({
      recipientId: user._id,
      title: 'Ticket Booking Confirmed! 🎉',
      message: `You have successfully booked ${createdTickets.length} ticket(s) for "${event.title}".`,
      type: NOTIFICATION_TYPES.TICKET_CONFIRMED,
      link: '/dashboard/tickets.html'
    });

    // Notify Organizer
    if (event.organizer) {
      await NotificationService.sendNotification({
        recipientId: event.organizer._id || event.organizer,
        title: 'New Event Registration',
        message: `${attendeeInfo?.name || user.name} registered for "${event.title}" (${createdTickets.length} ticket(s)).`,
        type: NOTIFICATION_TYPES.REGISTRATION,
        link: '/dashboard/attendees.html'
      });
    }

    // Send confirmation email
    if (createdTickets.length > 0) {
      EmailService.sendTicketConfirmation({
        to: attendeeInfo?.email || user.email,
        userName: attendeeInfo?.name || user.name,
        eventTitle: event.title,
        ticketNumber: createdTickets[0].ticketNumber,
        eventDate: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        venueName: event.venueDetails?.name || 'Event Venue',
        ticketType: createdTickets[0].ticketType
      });
    }

    return {
      registration,
      payment,
      tickets: createdTickets
    };
  }

  /**
   * Check-in an attendee using ticket ID or Ticket Number
   */
  static async checkInTicket(identifier, organizerId) {
    let ticket;
    if (identifier.startsWith('ESP-')) {
      ticket = await Ticket.findOne({ ticketNumber: identifier }).populate('event');
    } else {
      ticket = await Ticket.findById(identifier).populate('event');
    }

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status === TICKET_STATUS.USED) {
      return {
        alreadyCheckedIn: true,
        checkedInAt: ticket.checkedInAt,
        ticket
      };
    }

    if (ticket.status === TICKET_STATUS.CANCELLED) {
      throw new Error('This ticket has been cancelled and is no longer valid.');
    }

    ticket.status = TICKET_STATUS.USED;
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = organizerId;
    await ticket.save();

    return {
      alreadyCheckedIn: false,
      ticket
    };
  }
}

module.exports = TicketService;
