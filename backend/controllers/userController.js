const User = require('../models/User');
const Event = require('../models/Event');
const { ROLES } = require('../config/constants');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, organizationName, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (organizationName !== undefined) user.organizationName = organizationName;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        organizationName: user.organizationName,
        bio: user.bio,
        favorites: user.favorites
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload user avatar photo
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid image file (JPG, PNG, WEBP)' });
    }

    const avatarUrl = `/uploads/temp/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.profileImage = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded and profile updated successfully.',
      avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        organizationName: user.organizationName,
        bio: user.bio,
        favorites: user.favorites
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle favorite event
// @route   POST /api/users/favorites/:eventId
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const user = await User.findById(req.user._id);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const index = user.favorites.indexOf(eventId);
    let isFavorite = false;

    if (index > -1) {
      user.favorites.splice(index, 1);
      isFavorite = false;
    } else {
      user.favorites.push(eventId);
      isFavorite = true;
    }

    await user.save();

    res.json({
      success: true,
      isFavorite,
      favorites: user.favorites,
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
      users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role or status (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role, isVerified } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role && Object.values(ROLES).includes(role)) {
      user.role = role;
    }
    if (isVerified !== undefined) {
      user.isVerified = isVerified;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  uploadAvatar,
  toggleFavorite,
  getAllUsers,
  updateUserRole,
  deleteUser
};
