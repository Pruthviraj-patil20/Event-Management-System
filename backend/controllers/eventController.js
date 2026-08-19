const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Review = require('../models/Review');
const NotificationService = require('../services/notificationService');
const { EVENT_STATUS, ROLES, NOTIFICATION_TYPES } = require('../config/constants');

// @desc    Get all events (Filtered, Searched, Paginated)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      state,
      city,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      status,
      featured,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Status filter: Public only sees published unless specified by auth
    if (status) {
      query.status = status;
    } else {
      query.status = EVENT_STATUS.PUBLISHED;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    // State Filter
    if (state && state !== 'All') {
      const stateTrimmed = state.trim();
      const venuesInState = await Venue.find({
        $or: [
          { state: { $regex: stateTrimmed, $options: 'i' } }
        ]
      }).select('_id');
      const venueIds = venuesInState.map(v => v._id);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'venueDetails.state': { $regex: stateTrimmed, $options: 'i' } },
          { venue: { $in: venueIds } }
        ]
      });
    }

    // City Filter
    if (city && city !== 'All') {
      const cityTrimmed = city.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'venueDetails.city': { $regex: cityTrimmed, $options: 'i' } }
        ]
      });
    }

    // Text Search
    if (search && search.trim() !== '') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
          { 'venueDetails.name': { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Price filter (on ticketTypes)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceQuery = {};
      if (minPrice !== undefined) priceQuery.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceQuery.$lte = Number(maxPrice);
      query['ticketTypes.price'] = priceQuery;
    }

    // Sorting
    let sortOption = { date: 1 }; // Default: upcoming first
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'price-asc') {
      sortOption = { 'ticketTypes.0.price': 1 };
    } else if (sort === 'price-desc') {
      sortOption = { 'ticketTypes.0.price': -1 };
    } else if (sort === 'popular') {
      sortOption = { totalReviews: -1, averageRating: -1 };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email profileImage organizationName')
      .populate('venue')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured events for homepage showcase
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: EVENT_STATUS.PUBLISHED, featured: true })
      .populate('organizer', 'name email profileImage organizationName')
      .populate('venue')
      .sort({ date: 1 })
      .limit(6);

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event by ID or slug
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profileImage organizationName bio')
      .populate('venue');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or has been removed.'
      });
    }

    // Also fetch reviews
    const reviews = await Review.find({ event: event._id })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    // Fetch related events in same category
    const relatedEvents = await Event.find({
      category: event.category,
      _id: { $ne: event._id },
      status: EVENT_STATUS.PUBLISHED
    })
      .limit(3)
      .populate('venue');

    res.json({
      success: true,
      event,
      reviews,
      relatedEvents
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer / Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      venueId,
      venueName,
      venueAddress,
      venueCity,
      date,
      startTime,
      endTime,
      capacity,
      ticketTypes,
      image,
      tags,
      status = EVENT_STATUS.PUBLISHED,
      featured = false
    } = req.body;

    let venueDoc;
    if (venueId) {
      venueDoc = await Venue.findById(venueId);
    }

    if (!venueDoc) {
      venueDoc = await Venue.create({
        name: venueName || 'Grand Convention Center',
        address: venueAddress || 'Main Avenue',
        city: venueCity || 'Bangalore',
        state: req.body.venueState || '',
        capacity: capacity || 500,
        createdBy: req.user._id
      });
    }

    const defaultTickets = ticketTypes && ticketTypes.length > 0 ? ticketTypes : [
      {
        name: 'Standard',
        price: 499,
        quantity: Math.floor(capacity * 0.7) || 100,
        availableQuantity: Math.floor(capacity * 0.7) || 100,
        description: 'Full day access and refreshments'
      },
      {
        name: 'VIP',
        price: 1499,
        quantity: Math.floor(capacity * 0.3) || 30,
        availableQuantity: Math.floor(capacity * 0.3) || 30,
        description: 'Priority seating, speaker lounge access and swag pack'
      }
    ];

    // Ensure availableQuantity matches quantity for new tiers
    const formattedTicketTypes = defaultTickets.map(t => ({
      name: t.name,
      price: Number(t.price),
      quantity: Number(t.quantity),
      availableQuantity: Number(t.availableQuantity !== undefined ? t.availableQuantity : t.quantity),
      description: t.description || '',
      perks: t.perks || []
    }));

    const totalCap = parseInt(capacity, 10) || formattedTicketTypes.reduce((acc, curr) => acc + curr.quantity, 0);

    const event = await Event.create({
      title,
      description,
      shortDescription: shortDescription || description.substring(0, 150),
      category,
      organizer: req.user._id,
      venue: venueDoc._id,
      venueDetails: {
        name: venueDoc.name,
        address: venueDoc.address,
        city: venueDoc.city,
        state: venueDoc.state || ''
      },
      date: new Date(date),
      startTime: startTime || '09:00 AM',
      endTime: endTime || '05:00 PM',
      capacity: totalCap,
      availableSeats: totalCap,
      ticketTypes: formattedTicketTypes,
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(s => s.trim()) : [category],
      status: req.user.role === ROLES.ADMIN ? status : EVENT_STATUS.PUBLISHED,
      featured: featured || false
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer / Admin)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== ROLES.ADMIN && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this event' });
    }

    // If venue updated
    if (req.body.venueId) {
      const v = await Venue.findById(req.body.venueId);
      if (v) {
        req.body.venue = v._id;
        req.body.venueDetails = { name: v.name, address: v.address, city: v.city, state: v.state || '' };
      }
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('venue');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer / Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== ROLES.ADMIN && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get organizer's own events
// @route   GET /api/events/my/created
// @access  Private (Organizer / Admin)
const getMyEvents = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { organizer: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query).populate('venue').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin moderation (Approve / Reject)
// @route   PUT /api/events/:id/moderate
// @access  Private (Admin only)
const moderateEvent = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const event = await Event.findById(req.params.id).populate('organizer');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (![EVENT_STATUS.PUBLISHED, EVENT_STATUS.CANCELLED, 'rejected', EVENT_STATUS.PENDING].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    event.status = status === 'rejected' ? EVENT_STATUS.CANCELLED : status;
    if (rejectionReason) {
      event.rejectionReason = rejectionReason;
    }
    await event.save();

    // Send notification to organizer
    await NotificationService.sendNotification({
      recipientId: event.organizer._id,
      title: `Event ${status === EVENT_STATUS.PUBLISHED ? 'Approved' : 'Status Updated'}`,
      message: `Your event "${event.title}" status has been updated to: ${event.status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      type: status === EVENT_STATUS.PUBLISHED ? NOTIFICATION_TYPES.EVENT_APPROVAL : NOTIFICATION_TYPES.EVENT_REJECTION,
      link: `/dashboard/my-events.html`
    });

    res.json({
      success: true,
      message: `Event status updated to ${event.status}`,
      event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a review for an event
// @route   POST /api/events/:id/reviews
// @access  Private (Attendee / All)
const addReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const alreadyReviewed = await Review.findOne({ event: event._id, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this event' });
    }

    const review = await Review.create({
      event: event._id,
      user: req.user._id,
      rating: Number(rating),
      title: title || '',
      comment
    });

    // Update event average rating
    const allReviews = await Review.find({ event: event._id });
    const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    event.averageRating = Number(avg.toFixed(1));
    event.totalReviews = allReviews.length;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  getFeaturedEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  moderateEvent,
  addReview
};
