const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Ticket = require('../models/Ticket');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const AdminActivity = require('../models/AdminActivity');
const { PAYMENT_STATUS, EVENT_STATUS, ROLES } = require('../config/constants');

const startOfPeriod = (period) => {
  const now = new Date();
  switch (period) {
    case 'today': return new Date(now.setHours(0, 0, 0, 0));
    case '7d': return new Date(now.getTime() - 7 * 86400000);
    case '30d': return new Date(now.getTime() - 30 * 86400000);
    case '90d': return new Date(now.getTime() - 90 * 86400000);
    case '6m': return new Date(now.setMonth(now.getMonth() - 6));
    case '12m': return new Date(now.setMonth(now.getMonth() - 12));
    default: return null;
  }
};

const growthPct = (cur, prev) => {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
};

const dateBucket = (period) => {
  if (['today', '7d', '30d', '90d'].includes(period)) {
    return {
      $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
    };
  }
  return {
    $dateToString: { format: '%Y-%m', date: '$createdAt' }
  };
};

/**
 * Compute the core dashboard statistics in parallel.
 */
const getDashboardStats = async () => {
  const [
    totalUsers,
    totalOrganizers,
    totalAttendees,
    totalEvents,
    publishedEvents,
    pendingEvents,
    completedEvents,
    totalTickets,
    totalRegistrations,
    pendingApprovals,
    failedPayments,
    hiddenReviews
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: ROLES.ORGANIZER }),
    User.countDocuments({ role: ROLES.ATTENDEE }),
    Event.countDocuments(),
    Event.countDocuments({ status: EVENT_STATUS.PUBLISHED }),
    Event.countDocuments({ status: EVENT_STATUS.PENDING }),
    Event.countDocuments({ status: EVENT_STATUS.COMPLETED }),
    Ticket.countDocuments({ status: { $ne: 'cancelled' } }),
    Registration.countDocuments(),
    Event.countDocuments({ status: EVENT_STATUS.PENDING }),
    Payment.countDocuments({ status: PAYMENT_STATUS.FAILED }),
    Review.countDocuments({ status: 'hidden' })
  ]);

  const revenueAgg = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.COMPLETED } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);

  const activeEvents = await Event.countDocuments({
    status: EVENT_STATUS.PUBLISHED,
    date: { $gte: new Date() }
  });

  // Growth deltas: last 30 days vs the 30 days before that
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const d60 = new Date(now.getTime() - 60 * 86400000);

  const [
    usersLast30,
    usersPrev30,
    organizersLast30,
    organizersPrev30,
    ticketsLast30,
    ticketsPrev30,
    registrationsLast30,
    registrationsPrev30
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: d30 } }),
    User.countDocuments({ createdAt: { $gte: d60, $lt: d30 } }),
    User.countDocuments({ role: ROLES.ORGANIZER, createdAt: { $gte: d30 } }),
    User.countDocuments({ role: ROLES.ORGANIZER, createdAt: { $gte: d60, $lt: d30 } }),
    Ticket.countDocuments({ createdAt: { $gte: d30 } }),
    Ticket.countDocuments({ createdAt: { $gte: d60, $lt: d30 } }),
    Registration.countDocuments({ createdAt: { $gte: d30 } }),
    Registration.countDocuments({ createdAt: { $gte: d60, $lt: d30 } })
  ]);

  const revenueAgg30 = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.COMPLETED, createdAt: { $gte: d30 } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const revenueAggPrev = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.COMPLETED, createdAt: { $gte: d60, $lt: d30 } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const revenueLast30 = revenueAgg30[0] ? revenueAgg30[0].total : 0;
  const revenuePrev30 = revenueAggPrev[0] ? revenueAggPrev[0].total : 0;

  return {
    totalUsers,
    totalOrganizers,
    totalAttendees,
    totalEvents,
    publishedEvents,
    pendingEvents,
    completedEvents,
    activeEvents,
    totalRevenue: revenueAgg[0] ? revenueAgg[0].total : 0,
    totalPayments: revenueAgg[0] ? revenueAgg[0].count : 0,
    totalTickets,
    totalRegistrations,
    pendingApprovals,
    failedPayments,
    hiddenReviews,
    growth: {
      users: growthPct(usersLast30, usersPrev30),
      organizers: growthPct(organizersLast30, organizersPrev30),
      revenue: growthPct(revenueLast30, revenuePrev30),
      tickets: growthPct(ticketsLast30, ticketsPrev30),
      registrations: growthPct(registrationsLast30, registrationsPrev30)
    }
  };
};

/**
 * Build the revenue trend series for the given period.
 */
const getRevenueTrend = async (period = '12m') => {
  const from = startOfPeriod(period);
  const match = { status: PAYMENT_STATUS.COMPLETED };
  if (from) match.createdAt = { $gte: from };

  const revenue = await Payment.aggregate([
    { $match: match },
    { $group: { _id: dateBucket(period), revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const tickets = await Ticket.aggregate([
    { $match: from ? { createdAt: { $gte: from } } : {} },
    { $group: { _id: dateBucket(period), count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const labels = revenue.map((r) => r._id);
  return {
    labels,
    revenue: revenue.map((r) => r.revenue),
    tickets: tickets.map((t) => t.count)
  };
};

/**
 * Event status distribution for the doughnut chart.
 */
const getEventStatusDistribution = async () => {
  const dist = await Event.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const order = Object.values(EVENT_STATUS);
  dist.sort((a, b) => order.indexOf(a._id) - order.indexOf(b._id));
  return {
    labels: dist.map((d) => d._id),
    values: dist.map((d) => d.count)
  };
};

/**
 * Registration trend series per period.
 */
const getRegistrationTrend = async (period = '30d') => {
  const from = startOfPeriod(period);
  const match = from ? { createdAt: { $gte: from } } : {};
  const agg = await Registration.aggregate([
    { $match: match },
    { $group: { _id: dateBucket(period), count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  return {
    labels: agg.map((a) => a._id),
    values: agg.map((a) => a.count)
  };
};

/**
 * Recent events for the dashboard table.
 */
const getRecentEvents = async (limit = 6) => {
  return Event.find({})
    .populate('organizer', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getRecentUsers = async (limit = 6) => {
  return User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const getRecentActivity = async (limit = 8) => {
  return AdminActivity.find({}).populate('admin', 'name profileImage').sort({ createdAt: -1 }).limit(limit);
};

/**
 * Assemble the full dashboard payload consumed by /api/admin/dashboard.
 */
const getDashboard = async () => {
  const [
    stats,
    revenueTrend,
    eventStatus,
    registrationTrend,
    recentEvents,
    recentUsers,
    pendingEvents,
    recentActivity
  ] = await Promise.all([
    getDashboardStats(),
    getRevenueTrend('12m'),
    getEventStatusDistribution(),
    getRegistrationTrend('30d'),
    getRecentEvents(6),
    getRecentUsers(6),
    Event.find({ status: EVENT_STATUS.PENDING }).populate('organizer', 'name email').sort({ createdAt: -1 }).limit(5),
    getRecentActivity(8)
  ]);

  return { stats, revenueTrend, eventStatus, registrationTrend, recentEvents, recentUsers, pendingEvents, recentActivity };
};

/**
 * Per-organizer stats: event count, capacity, tickets sold, revenue, rating.
 */
const getOrganizerStats = async (organizerIds) => {
  if (!organizerIds.length) return {};

  const events = await Event.aggregate([
    { $match: { organizer: { $in: organizerIds } } },
    {
      $group: {
        _id: '$organizer',
        eventCount: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' },
        availableSeats: { $sum: '$availableSeats' },
        totalReviews: { $sum: '$totalReviews' }
      }
    }
  ]);

  const payments = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.COMPLETED } },
    { $lookup: { from: 'events', localField: 'event', foreignField: '_id', as: 'eventDoc' } },
    { $unwind: { path: '$eventDoc', preserveNullAndEmptyArrays: false } },
    { $group: { _id: '$eventDoc.organizer', revenue: { $sum: '$amount' }, tickets: { $sum: 1 } } }
  ]);

  const ratings = await Event.aggregate([
    { $match: { organizer: { $in: organizerIds }, averageRating: { $gt: 0 } } },
    { $group: { _id: '$organizer', rating: { $avg: '$averageRating' } } }
  ]);

  const stats = {};
  events.forEach((e) => {
    stats[e._id] = {
      eventCount: e.eventCount,
      totalCapacity: e.totalCapacity,
      availableSeats: e.availableSeats,
      totalReviews: e.totalReviews
    };
  });
  payments.forEach((p) => {
    if (!stats[p._id]) stats[p._id] = {};
    stats[p._id].revenue = p.revenue;
    stats[p._id].ticketsSold = p.tickets;
  });
  ratings.forEach((r) => {
    if (!stats[r._id]) stats[r._id] = {};
    stats[r._id].averageRating = Math.round(r.rating * 10) / 10;
  });

  return stats;
};

/**
 * Analytics series for the analytics page.
 */
const getAnalytics = async (period = '30d', { from: customFrom, to: customTo } = {}) => {
  let from = startOfPeriod(period);
  if (customFrom) from = new Date(customFrom);
  const to = customTo ? new Date(customTo) : null;
  const matchRange = { ...(from ? { createdAt: { $gte: from } } : {}) };
  if (to) matchRange.createdAt = { ...(matchRange.createdAt || {}), $lte: to };

  const series = (Model, extraMatch) =>
    Model.aggregate([
      { $match: { ...matchRange, ...extraMatch } },
      { $group: { _id: dateBucket(period), count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

  const [userGrowth, eventGrowth, registrations, tickets] = await Promise.all([
    series(User),
    series(Event),
    series(Registration),
    series(Ticket)
  ]);

  const revenue = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.COMPLETED, ...matchRange } },
    { $group: { _id: dateBucket(period), revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const categories = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const regMatch = { ...matchRange };
  const topEvents = await Registration.aggregate([
    { $match: regMatch },
    {
      $group: {
        _id: '$event',
        registrations: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { registrations: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'eventDoc'
      }
    },
    { $unwind: '$eventDoc' }
  ]);

  const topOrganizers = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.COMPLETED, ...matchRange } },
    { $lookup: { from: 'events', localField: 'event', foreignField: '_id', as: 'eventDoc' } },
    { $unwind: '$eventDoc' },
    {
      $group: {
        _id: '$eventDoc.organizer',
        revenue: { $sum: '$amount' },
        sales: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 8 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDoc' } },
    { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } }
  ]);

  return {
    userGrowth,
    eventGrowth,
    registrations,
    tickets,
    revenue,
    categories,
    topEvents: topEvents.map((t) => ({
      id: t._id,
      title: t.eventDoc.title,
      category: t.eventDoc.category,
      registrations: t.registrations,
      revenue: t.revenue
    })),
    topOrganizers: topOrganizers.map((o) => ({
      id: o._id,
      name: o.userDoc ? o.userDoc.name : 'Unknown',
      email: o.userDoc ? o.userDoc.email : '',
      revenue: o.revenue,
      sales: o.sales
    }))
  };
};

/**
 * Report datasets used by the reports page / CSV export.
 */
const getReport = async (type, { from, to } = {}) => {
  const range = {};
  if (from) range.createdAt = { $gte: new Date(from) };
  if (to) range.createdAt = { ...(range.createdAt || {}), $lte: new Date(to) };

  switch (type) {
    case 'users': {
      const users = await User.find(range).select('-password').sort({ createdAt: -1 });
      return users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        organization: u.organizationName,
        verified: u.isVerified ? 'Yes' : 'No',
        active: u.isActive ? 'Yes' : 'No',
        joined: u.createdAt.toISOString()
      }));
    }
    case 'organizers': {
      const organizers = await User.find({ role: ROLES.ORGANIZER, ...range })
        .select('-password')
        .sort({ createdAt: -1 });
      const stats = await getOrganizerStats(organizers.map((o) => o._id));
      return organizers.map((o) => ({
        id: o._id,
        name: o.name,
        email: o.email,
        organization: o.organizationName,
        events: stats[o._id] ? stats[o._id].eventCount || 0 : 0,
        ticketsSold: stats[o._id] ? stats[o._id].ticketsSold || 0 : 0,
        revenue: stats[o._id] ? stats[o._id].revenue || 0 : 0,
        rating: stats[o._id] && stats[o._id].averageRating ? stats[o._id].averageRating : 0,
        joined: o.createdAt.toISOString()
      }));
    }
    case 'events': {
      const events = await Event.find(range).populate('organizer', 'name email').sort({ createdAt: -1 });
      return events.map((e) => ({
        id: e._id,
        title: e.title,
        category: e.category,
        status: e.status,
        organizer: e.organizer ? e.organizer.name : '',
        venue: e.venueDetails ? `${e.venueDetails.name}, ${e.venueDetails.city}` : '',
        date: e.date.toISOString(),
        capacity: e.capacity,
        availableSeats: e.availableSeats,
        featured: e.featured ? 'Yes' : 'No',
        rating: e.averageRating
      }));
    }
    case 'revenue': {
      const payments = await Payment.find({ status: PAYMENT_STATUS.COMPLETED, ...range })
        .populate('user', 'name email')
        .populate('event', 'title')
        .sort({ createdAt: -1 });
      return payments.map((p) => ({
        id: p._id,
        transactionId: p.transactionId,
        user: p.user ? p.user.name : '',
        email: p.user ? p.user.email : '',
        event: p.event ? p.event.title : '',
        amount: p.amount,
        method: p.paymentMethod,
        date: p.createdAt.toISOString()
      }));
    }
    case 'tickets': {
      const tickets = await Ticket.find(range)
        .populate('user', 'name email')
        .populate('event', 'title')
        .sort({ createdAt: -1 });
      return tickets.map((t) => ({
        id: t._id,
        ticketNumber: t.ticketNumber,
        attendee: t.attendeeName,
        email: t.attendeeEmail,
        event: t.event ? t.event.title : '',
        type: t.ticketType,
        price: t.price,
        status: t.status,
        checkedIn: t.checkedInAt ? t.checkedInAt.toISOString() : ''
      }));
    }
    case 'registrations': {
      const registrations = await Registration.find(range)
        .populate('user', 'name email')
        .populate('event', 'title')
        .sort({ createdAt: -1 });
      return registrations.map((r) => ({
        id: r._id,
        registrationNumber: r.registrationNumber,
        attendee: r.attendeeInfo.name,
        email: r.attendeeInfo.email,
        event: r.event ? r.event.title : '',
        items: r.items.reduce((s, i) => s + i.quantity, 0),
        total: r.totalAmount,
        paymentStatus: r.paymentStatus,
        date: r.createdAt.toISOString()
      }));
    }
    default:
      return [];
  }
};

module.exports = {
  getDashboard,
  getDashboardStats,
  getRevenueTrend,
  getEventStatusDistribution,
  getRegistrationTrend,
  getRecentEvents,
  getRecentUsers,
  getRecentActivity,
  getOrganizerStats,
  getAnalytics,
  getReport
};