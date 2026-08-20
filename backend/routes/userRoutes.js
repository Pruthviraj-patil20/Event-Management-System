const express = require('express');
const router = express.Router();
const {
  updateProfile,
  uploadAvatar,
  toggleFavorite,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/favorites/:eventId', toggleFavorite);

// Admin-only user management
router.get('/', authorize('admin'), getAllUsers);
router.put('/:id', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
