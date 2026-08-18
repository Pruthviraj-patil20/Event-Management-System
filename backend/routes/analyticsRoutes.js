const express = require('express');
const router = express.Router();
const {
  getOverview,
  getRevenueAnalytics,
  getAdminAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/overview', authorize('organizer', 'admin'), getOverview);
router.get('/revenue', authorize('organizer', 'admin'), getRevenueAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

module.exports = router;
