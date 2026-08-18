const express = require('express');
const router = express.Router();
const {
  getEvents,
  getFeaturedEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  moderateEvent,
  addReview
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { validateCreateEvent } = require('../validators/eventValidator');

// Public routes
router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/my/created', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id', getEventById);

// Protected Organizer / Admin routes
router.post('/', protect, authorize('organizer', 'admin'), validate(validateCreateEvent), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

// Reviews
router.post('/:id/reviews', protect, addReview);

// Admin Moderation
router.put('/:id/moderate', protect, authorize('admin'), moderateEvent);

module.exports = router;
