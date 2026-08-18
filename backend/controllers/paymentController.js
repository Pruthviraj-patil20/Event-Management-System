const Payment = require('../models/Payment');
const { generateTransactionId } = require('../utils/generateTicket');

// @desc    Initiate payment order (Gateway Simulation)
// @route   POST /api/payments/create
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', eventId } = req.body;

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    res.json({
      success: true,
      order: {
        id: orderId,
        amount: Math.round(Number(amount) * 100), // in paise / cents
        currency,
        key: process.env.PAYMENT_KEY || 'rzp_test_eventsphere_2026'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, orderId } = req.body;

    res.json({
      success: true,
      message: 'Payment verified successfully.',
      transactionId: paymentId || generateTransactionId()
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payments (Admin / Organizer)
// @route   GET /api/payments
// @access  Private (Admin / Organizer)
const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = {};

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      payments
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getAllPayments
};
