const Ticket = require('../models/Ticket');
const TicketService = require('../services/ticketService');

// @desc    Purchase tickets for an event
// @route   POST /api/tickets/purchase
// @access  Private
const purchase = async (req, res, next) => {
  try {
    const { eventId, items, attendeeInfo, paymentMethod } = req.body;

    const result = await TicketService.purchaseTickets({
      user: req.user,
      eventId,
      items,
      attendeeInfo,
      paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! 🎉',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get tickets for logged-in attendee
// @route   GET /api/tickets/my
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'venue' }
      })
      .populate('registration')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'event',
        populate: [{ path: 'venue' }, { path: 'organizer', select: 'name email organizationName' }]
      })
      .populate('registration');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify authorization: owner, event organizer, or admin
    if (
      req.user.role !== 'admin' &&
      ticket.user.toString() !== req.user._id.toString() &&
      ticket.event.organizer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    res.json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};

// @desc    Check-in ticket (QR Scan / ID Verification)
// @route   POST /api/tickets/:id/checkin
// @access  Private (Organizer / Admin)
const checkIn = async (req, res, next) => {
  try {
    const result = await TicketService.checkInTicket(req.params.id, req.user._id);
    res.json({
      success: true,
      message: result.alreadyCheckedIn ? 'Warning: Ticket was already checked in!' : 'Attendee Checked In Successfully! ✅',
      ...result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets
// @access  Private/Admin
const getAllTickets = async (req, res, next) => {
  try {
    const { status, eventId, page = 1, limit = 25 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate('event', 'title date venueDetails')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      tickets
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  purchase,
  getMyTickets,
  getTicketById,
  checkIn,
  getAllTickets
};
