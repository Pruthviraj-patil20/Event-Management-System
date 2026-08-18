const express = require('express');
const router = express.Router();
const { getAttendees, exportAttendeesCSV } = require('../controllers/attendeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('organizer', 'admin'));

router.get('/', getAttendees);
router.get('/export', exportAttendeesCSV);

module.exports = router;
