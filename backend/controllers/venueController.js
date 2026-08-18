const Venue = require('../models/Venue');

// @desc    Get all venues
// @route   GET /api/venues
// @access  Public
const getVenues = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isApproved: true };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const venues = await Venue.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: venues.length,
      venues
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
// @access  Public
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.json({ success: true, venue });
  } catch (err) {
    next(err);
  }
};

// @desc    Create venue
// @route   POST /api/venues
// @access  Private (Organizer / Admin)
const createVenue = async (req, res, next) => {
  try {
    const { name, address, city, state, capacity, amenities, contactEmail, contactPhone, image } = req.body;

    const venue = await Venue.create({
      name,
      address,
      city,
      state: state || '',
      capacity: parseInt(capacity, 10) || 500,
      amenities: Array.isArray(amenities) ? amenities : amenities ? amenities.split(',').map(s => s.trim()) : ['Wi-Fi', 'Parking', 'Audio/Visual'],
      contactEmail,
      contactPhone,
      image: image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      venue
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Admin / Venue Creator)
const updateVenue = async (req, res, next) => {
  try {
    let venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Check ownership or admin
    if (req.user.role !== 'admin' && venue.createdBy && venue.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this venue' });
    }

    venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Venue updated successfully',
      venue
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
// @access  Private (Admin only)
const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    await venue.deleteOne();
    res.json({ success: true, message: 'Venue removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
};
