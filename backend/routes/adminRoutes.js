const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Users
router.get('/users', getUsers);
router.put('/users/:id/status', setUserStatus);
router.put('/users/:id/role', setUserRole);
router.put('/users/:id/verify', toggleUserVerified);
router.delete('/users/:id', deleteUser);

// Organizers
router.get('/organizers', getOrganizers);

// Events
router.get('/events', getAdminEvents);
router.put('/events/:id/feature', toggleFeatured);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);
router.delete('/events/:id', deleteAdminEvent);

// Venues
router.get('/venues', getVenues);
router.post('/venues', createVenue);
router.put('/venues/:id', updateVenue);
router.delete('/venues/:id', deleteVenue);

// Tickets
router.get('/tickets', getTickets);
router.post('/tickets/:id/checkin', checkinTicket);

// Registrations
router.get('/registrations', getRegistrations);
router.post('/registrations/:id/cancel', cancelRegistration);

// Payments
router.get('/payments', getPayments);

// Reviews
router.get('/reviews', getReviews);
router.put('/reviews/:id/status', setReviewStatus);
router.delete('/reviews/:id', deleteReview);

// Analytics & Reports
router.get('/analytics', getAdminAnalytics);
router.get('/reports/:type', getReport);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllRead);
router.put('/notifications/:id/read', markOneRead);
router.delete('/notifications/:id', deleteNotification);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Activity log
router.get('/activity', getActivity);

// Global search
router.get('/search', globalSearch);

// Admin profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/password', changePassword);

module.exports = router;