const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { ROLES } = require('../config/constants');
const NotificationService = require('../services/notificationService');

// @desc    Register a new user (Attendee or Organizer)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, organizationName, bio } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const assignedRole = role === ROLES.ORGANIZER ? ROLES.ORGANIZER : ROLES.ATTENDEE;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: assignedRole,
      organizationName: organizationName || '',
      bio: bio || ''
    });

    const token = generateToken(user._id, user.role);

    // Send welcome notification
    await NotificationService.sendNotification({
      recipientId: user._id,
      title: 'Welcome to EventSphere! 🚀',
      message: `Hi ${user.name}, welcome aboard. Discover, plan, and experience events worldwide.`,
      type: 'system',
      link: user.role === ROLES.ORGANIZER ? '/dashboard/dashboard.html' : '/events.html'
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        organizationName: user.organizationName,
        favorites: user.favorites
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        organizationName: user.organizationName,
        favorites: user.favorites
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log out user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// @desc    Forgot Password Request (Simulated)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success anyway for security timing protection
      return res.json({
        success: true,
        message: 'If that email is registered with us, a password reset link has been dispatched.'
      });
    }

    res.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password (Simulated)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    res.json({
      success: true,
      message: 'Your password has been successfully updated. You may now log in.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
};
