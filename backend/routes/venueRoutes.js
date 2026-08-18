const express = require('express');
const router = express.Router();
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} = require('../controllers/venueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getVenues);
router.get('/:id', getVenueById);

router.post('/', protect, authorize('organizer', 'admin'), createVenue);
router.put('/:id', protect, authorize('organizer', 'admin'), updateVenue);
router.delete('/:id', protect, authorize('admin'), deleteVenue);

module.exports = router;
