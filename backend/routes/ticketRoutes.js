const express = require('express');
const router = express.Router();
const {
  purchase,
  getMyTickets,
  getTicketById,
  checkIn,
  getAllTickets
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { validateTicketPurchase } = require('../validators/ticketValidator');

router.use(protect);

router.post('/purchase', validate(validateTicketPurchase), purchase);
router.get('/my', getMyTickets);
router.get('/all', authorize('admin', 'organizer'), getAllTickets);
router.get('/:id', getTicketById);
router.post('/:id/checkin', authorize('organizer', 'admin'), checkIn);

module.exports = router;
