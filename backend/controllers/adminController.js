const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Ticket = require('../models/Ticket');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const SystemSettings = require('../models/SystemSettings');
const AdminActivity = require('../models/AdminActivity');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const adminService = require('../services/adminService');
const { logActivity } = require('../services/activityService');
const { ROLES, EVENT_STATUS, NOTIFICATION_TYPES, PAYMENT_STATUS, TICKET_STATUS } = require('../config/constants');

const pagination = (query, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

const clientIp = (req) => String(req.ip || '').replace(/^::ffff:/, '');

/* ============================ DASHBOARD ============================ */

// @desc    Admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

/* ============================= USERS ============================== */

// @desc    List users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'suspended') query.isActive = false;
    if (status === 'unverified') query.isVerified = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const ids = users.map((u) => u._id);
    const [regCounts, eventCounts] = await Promise.all([
      Registration.aggregate([
        { $match: { user: { $in: ids } } },
        { $group: { _id: '$user', count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $match: { organizer: { $in: ids } } },
        { $group: { _id: '$organizer', count: { $sum: 1 } } }
      ])
    ]);
    const regMap = Object.fromEntries(regCounts.map((r) => [String(r._id), r.count]));
    const eventMap = Object.fromEntries(eventCounts.map((e) => [String(e._id), e.count]));

    const enriched = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      profileImage: u.profileImage,
      organizationName: u.organizationName,
      bio: u.bio,
      isVerified: u.isVerified,
      isActive: u.isActive,
      createdAt: u.createdAt,
      registrationCount: regMap[u._id] || 0,
      eventCount: eventMap[u._id] || 0
    }));

    res.json({ success: true, count: enriched.length, total, totalPages: Math.ceil(total / limit), currentPage: page, users: enriched });
  } catch (err) {
    next(err);
  }
};

// @desc    Set user active/suspended
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const setUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own account' });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    await logActivity({
      admin: req.user,
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.name,
      ip: clientIp(req)
    });

    res.json({ success: true, message: `User ${isActive ? 'activated' : 'suspended'}`, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    await logActivity({
      admin: req.user,
      action: 'USER_ROLE_CHANGED',
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.name,
      details: `Role changed to ${role}`,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'User role updated', user });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user verification
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const toggleUserVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isVerified = !user.isVerified;
    await user.save();

    await logActivity({
      admin: req.user,
      action: user.isVerified ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.name,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'User verification updated', user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    await user.deleteOne();

    await logActivity({
      admin: req.user,
      action: 'USER_DELETED',
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.name,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    next(err);
  }
};

/* =========================== ORGANIZERS =========================== */

// @desc    List organizers with performance stats
// @route   GET /api/admin/organizers
// @access  Private/Admin
const getOrganizers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = { role: ROLES.ORGANIZER };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const organizers = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);

    const stats = await adminService.getOrganizerStats(organizers.map((o) => o._id));

    const rows = organizers.map((o) => {
      const s = stats[o._id] || {};
      return {
        id: o._id,
        name: o.name,
        email: o.email,
        profileImage: o.profileImage,
        organizationName: o.organizationName,
        phone: o.phone,
        isActive: o.isActive,
        isVerified: o.isVerified,
        createdAt: o.createdAt,
        stats: {
          eventCount: s.eventCount || 0,
          ticketsSold: s.ticketsSold || 0,
          revenue: s.revenue || 0,
          averageRating: s.averageRating || 0,
          totalReviews: s.totalReviews || 0
        }
      };
    });

    res.json({ success: true, count: rows.length, total, totalPages: Math.ceil(total / limit), currentPage: page, organizers: rows });
  } catch (err) {
    next(err);
  }
};

/* ============================= EVENTS ============================= */

// @desc    List all events for admin
// @route   GET /api/admin/events
// @access  Private/Admin
const getAdminEvents = async (req, res, next) => {
  try {
    const { search, category, status, organizer, sort } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'venueDetails.city': { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (organizer && organizer !== 'all') query.organizer = organizer;

    let sortOption = { createdAt: -1 };
    if (sort === 'date-asc') sortOption = { date: 1 };
    if (sort === 'date-desc') sortOption = { date: -1 };
    if (sort === 'name') sortOption = { title: 1 };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email organizationName')
      .populate('venue', 'name city')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const ids = events.map((e) => e._id);
    const revenueMap = {};
    if (ids.length) {
      const agg = await Payment.aggregate([
        { $match: { status: PAYMENT_STATUS.COMPLETED, event: { $in: ids } } },
        { $group: { _id: '$event', total: { $sum: '$amount' }, sales: { $sum: 1 } } }
      ]);
      agg.forEach((r) => {
        revenueMap[r._id] = { revenue: r.total, sales: r.sales };
      });
    }

    const enriched = events.map((e) => {
      const r = revenueMap[e._id] || { revenue: 0, sales: 0 };
      return {
        id: e._id,
        title: e.title,
        description: e.description,
        shortDescription: e.shortDescription,
        category: e.category,
        image: e.image,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        status: e.status,
        rejectionReason: e.rejectionReason,
        featured: e.featured,
        tags: e.tags,
        capacity: e.capacity,
        availableSeats: e.availableSeats,
        ticketTypes: e.ticketTypes,
        averageRating: e.averageRating,
        totalReviews: e.totalReviews,
        createdAt: e.createdAt,
        organizer: e.organizer ? { id: e.organizer._id, name: e.organizer.name, email: e.organizer.email, organizationName: e.organizer.organizationName } : null,
        venue: e.venue ? { id: e.venue._id, name: e.venue.name, city: e.venue.city } : (e.venueDetails || null),
        ticketsSold: Math.max((e.capacity || 0) - (e.availableSeats || 0), 0),
        revenue: r.revenue,
        paymentSales: r.sales
      };
    });

    res.json({ success: true, count: enriched.length, total, totalPages: Math.ceil(total / limit), currentPage: page, events: enriched });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle featured flag
// @route   PUT /api/admin/events/:id/feature
// @access  Private/Admin
const toggleFeatured = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.featured = !event.featured;
    await event.save();

    await logActivity({
      admin: req.user,
      action: event.featured ? 'EVENT_FEATURED' : 'EVENT_UNFEATURED',
      targetType: 'event',
      targetId: event._id,
      targetLabel: event.title,
      ip: clientIp(req)
    });

    res.json({ success: true, message: event.featured ? 'Event marked as featured' : 'Event removed from featured', event });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve a pending event
// @route   PUT /api/admin/events/:id/approve
// @access  Private/Admin
const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== EVENT_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: 'Only pending events can be approved' });
    }

    event.status = EVENT_STATUS.PUBLISHED;
    event.rejectionReason = '';
    await event.save();

    await NotificationService.sendNotification({
      recipientId: event.organizer._id,
      title: 'Event Approved 🎉',
      message: `Your event "${event.title}" has been approved and is now live.`,
      type: NOTIFICATION_TYPES.EVENT_APPROVAL,
      link: '/dashboard/my-events.html'
    });

    await logActivity({
      admin: req.user,
      action: 'EVENT_APPROVED',
      targetType: 'event',
      targetId: event._id,
      targetLabel: event.title,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Event approved and published', event });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject a pending event with reason
// @route   PUT /api/admin/events/:id/reject
// @access  Private/Admin
const rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required' });
    }

    const event = await Event.findById(req.params.id).populate('organizer');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== EVENT_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: 'Only pending events can be rejected' });
    }

    event.status = EVENT_STATUS.CANCELLED;
    event.rejectionReason = String(reason).trim();
    await event.save();

    await NotificationService.sendNotification({
      recipientId: event.organizer._id,
      title: 'Event Rejected',
      message: `Your event "${event.title}" was not approved. Reason: ${reason}`,
      type: NOTIFICATION_TYPES.EVENT_REJECTION,
      link: '/dashboard/my-events.html'
    });

    await logActivity({
      admin: req.user,
      action: 'EVENT_REJECTED',
      targetType: 'event',
      targetId: event._id,
      targetLabel: event.title,
      details: reason,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Event rejected', event });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event (admin)
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
const deleteAdminEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    await event.deleteOne();

    await logActivity({
      admin: req.user,
      action: 'EVENT_DELETED',
      targetType: 'event',
      targetId: event._id,
      targetLabel: event.title,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* ============================= VENUES ============================= */

// @desc    List venues
// @route   GET /api/admin/venues
// @access  Private/Admin
const getVenues = async (req, res, next) => {
  try {
    const { search, city } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }];
    }
    if (city && city !== 'all') query.city = city;

    const total = await Venue.countDocuments(query);
    const venues = await Venue.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ success: true, count: venues.length, total, totalPages: Math.ceil(total / limit), currentPage: page, venues });
  } catch (err) {
    next(err);
  }
};

// @desc    Create venue
// @route   POST /api/admin/venues
// @access  Private/Admin
const createVenue = async (req, res, next) => {
  try {
    const { name, address, city, state, country, postalCode, capacity, amenities, contactEmail, contactPhone, image, isApproved } = req.body;
    if (!name || !address || !city || !capacity) {
      return res.status(400).json({ success: false, message: 'Name, address, city and capacity are required' });
    }

    const venue = await Venue.create({
      name,
      address,
      city,
      state: state || '',
      country: country || 'India',
      postalCode: postalCode || '',
      capacity: Number(capacity),
      amenities: Array.isArray(amenities) ? amenities : [],
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      image: image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      isApproved: isApproved !== false,
      createdBy: req.user._id
    });

    await logActivity({
      admin: req.user,
      action: 'VENUE_CREATED',
      targetType: 'venue',
      targetId: venue._id,
      targetLabel: venue.name,
      ip: clientIp(req)
    });

    res.status(201).json({ success: true, message: 'Venue created successfully', venue });
  } catch (err) {
    next(err);
  }
};

// @desc    Update venue
// @route   PUT /api/admin/venues/:id
// @access  Private/Admin
const updateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    const allowed = ['name', 'address', 'city', 'state', 'country', 'postalCode', 'capacity', 'amenities', 'contactEmail', 'contactPhone', 'image', 'isApproved', 'mapUrl'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) venue[key] = req.body[key];
    });
    await venue.save();

    await logActivity({
      admin: req.user,
      action: 'VENUE_UPDATED',
      targetType: 'venue',
      targetId: venue._id,
      targetLabel: venue.name,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Venue updated successfully', venue });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete venue
// @route   DELETE /api/admin/venues/:id
// @access  Private/Admin
const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    await venue.deleteOne();

    await logActivity({
      admin: req.user,
      action: 'VENUE_DELETED',
      targetType: 'venue',
      targetId: venue._id,
      targetLabel: venue.name,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Venue removed successfully' });
  } catch (err) {
    next(err);
  }
};

/* ============================ TICKETS ============================= */

// @desc    List tickets
// @route   GET /api/admin/tickets
// @access  Private/Admin
const getTickets = async (req, res, next) => {
  try {
    const { search, status, event } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (event && event !== 'all') query.event = event;
    if (search) {
      const ids = await User.find({ $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }).select('_id');
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { attendeeName: { $regex: search, $options: 'i' } },
        { attendeeEmail: { $regex: search, $options: 'i' } },
        { user: { $in: ids.map((u) => u._id) } }
      ];
    }

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate('event', 'title date image')
      .populate('user', 'name email profileImage')
      .populate('registration', 'registrationNumber paymentStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, count: tickets.length, total, totalPages: Math.ceil(total / limit), currentPage: page, tickets });
  } catch (err) {
    next(err);
  }
};

// @desc    Check-in a ticket
// @route   POST /api/admin/tickets/:id/checkin
// @access  Private/Admin
const checkinTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event', 'title');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (ticket.status === TICKET_STATUS.CANCELLED) {
      return res.status(400).json({ success: false, message: 'Cancelled tickets cannot be checked in' });
    }

    const alreadyCheckedIn = ticket.checkedInAt;
    if (alreadyCheckedIn) {
      ticket.checkedInAt = null;
      ticket.checkedInBy = null;
      ticket.status = TICKET_STATUS.CONFIRMED;
    } else {
      ticket.checkedInAt = new Date();
      ticket.checkedInBy = req.user._id;
      ticket.status = TICKET_STATUS.USED;
    }
    await ticket.save();

    await logActivity({
      admin: req.user,
      action: alreadyCheckedIn ? 'TICKET_CHECKIN_REVERTED' : 'TICKET_CHECKED_IN',
      targetType: 'ticket',
      targetId: ticket._id,
      targetLabel: ticket.ticketNumber,
      details: ticket.event ? ticket.event.title : '',
      ip: clientIp(req)
    });

    res.json({ success: true, message: alreadyCheckedIn ? 'Check-in reverted' : 'Attendee checked in', ticket });
  } catch (err) {
    next(err);
  }
};

/* ========================== REGISTRATIONS ========================= */

// @desc    List registrations
// @route   GET /api/admin/registrations
// @access  Private/Admin
const getRegistrations = async (req, res, next) => {
  try {
    const { search, status, event } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};

    if (status && status !== 'all') query.paymentStatus = status;
    if (event && event !== 'all') query.event = event;
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { 'attendeeInfo.name': { $regex: search, $options: 'i' } },
        { 'attendeeInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .populate('event', 'title date image')
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const ids = registrations.map((r) => r._id);
    const checkedInMap = {};
    if (ids.length) {
      const tickets = await Ticket.aggregate([
        { $match: { registration: { $in: ids } } },
        { $group: { _id: '$registration', checkedIn: { $max: { $cond: [{ $ne: ['$checkedInAt', null] }, 1, 0] } }, count: { $sum: 1 } } }
      ]);
      tickets.forEach((t) => { checkedInMap[t._id] = { checkedIn: t.checkedIn > 0, ticketCount: t.count }; });
    }

    const enriched = registrations.map((r) => ({
      id: r._id,
      registrationNumber: r.registrationNumber,
      attendeeInfo: r.attendeeInfo,
      user: r.user ? { id: r.user._id, name: r.user.name, email: r.user.email, profileImage: r.user.profileImage } : null,
      event: r.event ? { id: r.event._id, title: r.event.title, date: r.event.date, image: r.event.image } : null,
      items: r.items,
      totalAmount: r.totalAmount,
      paymentStatus: r.paymentStatus,
      paymentMethod: r.paymentMethod,
      paymentId: r.paymentId,
      createdAt: r.createdAt,
      checkedIn: checkedInMap[r._id] ? checkedInMap[r._id].checkedIn : false,
      ticketCount: checkedInMap[r._id] ? checkedInMap[r._id].ticketCount : 0
    }));

    res.json({ success: true, count: enriched.length, total, totalPages: Math.ceil(total / limit), currentPage: page, registrations: enriched });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a registration
// @route   POST /api/admin/registrations/:id/cancel
// @access  Private/Admin
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event', 'title');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    if (registration.paymentStatus === PAYMENT_STATUS.REFUNDED) {
      return res.status(400).json({ success: false, message: 'Registration is already cancelled' });
    }

    registration.paymentStatus = PAYMENT_STATUS.REFUNDED;
    await registration.save();

    await Ticket.updateMany({ registration: registration._id }, { status: TICKET_STATUS.CANCELLED });

    await logActivity({
      admin: req.user,
      action: 'REGISTRATION_CANCELLED',
      targetType: 'registration',
      targetId: registration._id,
      targetLabel: registration.registrationNumber,
      details: registration.event ? registration.event.title : '',
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Registration cancelled and refunded', registration });
  } catch (err) {
    next(err);
  }
};

/* ============================ PAYMENTS ============================ */

// @desc    List payments
// @route   GET /api/admin/payments
// @access  Private/Admin
const getPayments = async (req, res, next) => {
  try {
    const { search, status, event, from, to } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (event && event !== 'all') query.event = event;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (search) {
      query.$or = [{ transactionId: { $regex: search, $options: 'i' } }];
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [completed, refunds, today, month, year] = await Promise.all([
      Payment.aggregate([
        { $match: { status: PAYMENT_STATUS.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { status: PAYMENT_STATUS.REFUNDED } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { status: PAYMENT_STATUS.COMPLETED, createdAt: { $gte: dayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: PAYMENT_STATUS.COMPLETED, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: PAYMENT_STATUS.COMPLETED, createdAt: { $gte: yearStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const sum = (a) => (a[0] ? a[0].total : 0);
    const totalRevenue = sum(completed);
    const refundsTotal = sum(refunds);

    const summary = {
      totalRevenue,
      todayRevenue: sum(today),
      monthRevenue: sum(month),
      yearRevenue: sum(year),
      refunds: refundsTotal,
      netRevenue: totalRevenue - refundsTotal
    };

    res.json({ success: true, count: payments.length, total, totalPages: Math.ceil(total / limit), currentPage: page, payments, summary });
  } catch (err) {
    next(err);
  }
};

/* ============================ REVIEWS ============================= */

// @desc    List reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getReviews = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [{ comment: { $regex: search, $options: 'i' } }, { title: { $regex: search, $options: 'i' } }];
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name email profileImage')
      .populate('event', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, count: reviews.length, total, totalPages: Math.ceil(total / limit), currentPage: page, reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or hide a review
// @route   PUT /api/admin/reviews/:id/status
// @access  Private/Admin
const setReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'hidden'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid review status' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.status = status;
    await review.save();

    await logActivity({
      admin: req.user,
      action: status === 'hidden' ? 'REVIEW_HIDDEN' : 'REVIEW_RESTORED',
      targetType: 'review',
      targetId: review._id,
      ip: clientIp(req)
    });

    res.json({ success: true, message: status === 'hidden' ? 'Review hidden' : 'Review restored', review });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await review.deleteOne();

    // Recompute event rating
    const event = await Event.findById(review.event);
    if (event) {
      const all = await Review.find({ event: event._id, status: 'active' });
      if (all.length) {
        const avg = all.reduce((acc, r) => acc + r.rating, 0) / all.length;
        event.averageRating = Number(avg.toFixed(1));
      } else {
        event.averageRating = 0;
      }
      event.totalReviews = all.length;
      await event.save();
    }

    await logActivity({
      admin: req.user,
      action: 'REVIEW_DELETED',
      targetType: 'review',
      targetId: review._id,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

/* =========================== ANALYTICS ============================ */

// @desc    Analytics data for charts
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    const period = ['today', '7d', '30d', '90d', '6m', '12m', 'all'].includes(req.query.period) ? req.query.period : '30d';
    const data = await adminService.getAnalytics(period, { from: req.query.from, to: req.query.to });
    res.json({ success: true, period, ...data });
  } catch (err) {
    next(err);
  }
};

/* ============================ REPORTS ============================= */

// @desc    Report data (JSON or CSV)
// @route   GET /api/admin/reports/:type
// @access  Private/Admin
const getReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const valid = ['users', 'organizers', 'events', 'revenue', 'tickets', 'registrations'];
    if (!valid.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    const rows = await adminService.getReport(type, req.query);

    if (req.query.format === 'csv' && rows.length) {
      const headers = Object.keys(rows[0]);
      const esc = (v) => `"${String(v === undefined || v === null ? '' : v).replace(/"/g, '""')}"`;
      const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      return res.send(csv);
    }

    res.json({ success: true, type, count: rows.length, rows });
  } catch (err) {
    next(err);
  }
};

/* ========================= NOTIFICATIONS ========================= */

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, unread, count: notifications.length, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications read
// @route   PUT /api/admin/notifications/read-all
// @access  Private/Admin
const markAllRead = async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
const markOneRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id, isRead: false },
      { isRead: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found or already read' });
    }
    res.json({ success: true, message: 'Notification marked as read', notification: notif });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: 'Notification removed' });
  } catch (err) {
    next(err);
  }
};

/* =========================== SETTINGS ============================ */

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne({ key: 'platform' });
    if (!settings) {
      settings = await SystemSettings.create({ key: 'platform' });
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne({ key: 'platform' });
    if (!settings) {
      settings = await SystemSettings.create({ key: 'platform' });
    }

    const sections = ['platform', 'event', 'payment', 'notification', 'security', 'appearance'];
    sections.forEach((section) => {
      if (req.body[section] && typeof req.body[section] === 'object') {
        Object.keys(req.body[section]).forEach((key) => {
          settings[section][key] = req.body[section][key];
        });
      }
    });

    settings.markModified('platform');
    settings.markModified('event');
    settings.markModified('payment');
    settings.markModified('notification');
    settings.markModified('security');
    settings.markModified('appearance');
    await settings.save();

    await logActivity({
      admin: req.user,
      action: 'SETTINGS_UPDATED',
      targetType: 'settings',
      targetId: settings._id,
      targetLabel: 'System Settings',
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (err) {
    next(err);
  }
};

/* =========================== ACTIVITY ============================ */

// @desc    Admin activity log
// @route   GET /api/admin/activity
// @access  Private/Admin
const getActivity = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = pagination(req.query);
    const query = {};
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { targetLabel: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await AdminActivity.countDocuments(query);
    const activities = await AdminActivity.find(query)
      .populate('admin', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, count: activities.length, total, totalPages: Math.ceil(total / limit), currentPage: page, activities });
  } catch (err) {
    next(err);
  }
};

/* ============================ SEARCH ============================== */

// @desc    Global admin search
// @route   GET /api/admin/search?q=
// @access  Private/Admin
const globalSearch = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ success: true, users: [], events: [], venues: [] });

    const re = { $regex: q, $options: 'i' };
    const [users, events, venues] = await Promise.all([
      User.find({ $or: [{ name: re }, { email: re }, { organizationName: re }] }).select('name email role profileImage organizationName isActive').limit(6),
      Event.find({ $or: [{ title: re }, { 'venueDetails.city': re }] }).select('title status category image date').limit(6),
      Venue.find({ $or: [{ name: re }, { city: re }] }).select('name city capacity image').limit(6)
    ]);

    res.json({ success: true, users, events, venues });
  } catch (err) {
    next(err);
  }
};

/* =========================== PROFILE ============================== */

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, bio, organizationName, profileImage } = req.body;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (profileImage) user.profileImage = profileImage;
    await user.save();

    await logActivity({
      admin: user,
      action: 'PROFILE_UPDATED',
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.name,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change admin password
// @route   POST /api/admin/profile/password
// @access  Private/Admin
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }
    const matches = await user.matchPassword(currentPassword);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      admin: user,
      action: 'PASSWORD_CHANGED',
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.name,
      ip: clientIp(req)
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  setUserStatus,
  setUserRole,
  toggleUserVerified,
  deleteUser,
  getOrganizers,
  getAdminEvents,
  toggleFeatured,
  approveEvent,
  rejectEvent,
  deleteAdminEvent,
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  getTickets,
  checkinTicket,
  getRegistrations,
  cancelRegistration,
  getPayments,
  getReviews,
  setReviewStatus,
  deleteReview,
  getAdminAnalytics,
  getReport,
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  getSettings,
  updateSettings,
  getActivity,
  globalSearch,
  getProfile,
  updateProfile,
  changePassword
};