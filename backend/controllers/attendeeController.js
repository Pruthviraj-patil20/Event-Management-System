const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// @desc    Get attendees for organizer's events
// @route   GET /api/attendees
// @access  Private (Organizer / Admin)
const getAttendees = async (req, res, next) => {
  try {
    const { eventId, search, ticketType, page = 1, limit = 50 } = req.query;

    let eventIds = [];
    if (eventId) {
      eventIds = [eventId];
    } else if (req.user.role !== 'admin') {
      const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
      eventIds = myEvents.map(e => e._id);
    }

    const query = {};
    if (eventIds.length > 0) {
      query.event = { $in: eventIds };
    }
    if (ticketType && ticketType !== 'All') {
      query.ticketType = ticketType;
    }
    if (search) {
      query.$or = [
        { attendeeName: { $regex: search, $options: 'i' } },
        { attendeeEmail: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Ticket.countDocuments(query);
    const attendees = await Ticket.find(query)
      .populate('event', 'title date venueDetails')
      .populate('user', 'name email phone')
      .populate('registration')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      attendees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export attendees as CSV
// @route   GET /api/attendees/export
// @access  Private (Organizer / Admin)
const exportAttendeesCSV = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const query = {};
    if (eventId) query.event = eventId;
    else if (req.user.role !== 'admin') {
      const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
      query.event = { $in: myEvents.map(e => e._id) };
    }

    const tickets = await Ticket.find(query)
      .populate('event', 'title date')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    let csv = 'Ticket Number,Attendee Name,Email,Event Title,Event Date,Ticket Tier,Price (INR),Status,Checked In\n';

    tickets.forEach(t => {
      const row = [
        `"${t.ticketNumber}"`,
        `"${t.attendeeName}"`,
        `"${t.attendeeEmail}"`,
        `"${t.event?.title || 'N/A'}"`,
        `"${t.event?.date ? new Date(t.event.date).toISOString().split('T')[0] : 'N/A'}"`,
        `"${t.ticketType}"`,
        t.price,
        `"${t.status}"`,
        `"${t.checkedInAt ? 'Yes' : 'No'}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendees-${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAttendees,
  exportAttendeesCSV
};
