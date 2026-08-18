const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getAllPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/create', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/', authorize('admin', 'organizer'), getAllPayments);

module.exports = router;
