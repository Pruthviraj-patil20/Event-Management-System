const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validate(validateRegister), register);
router.post('/login', validate(validateLogin), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
