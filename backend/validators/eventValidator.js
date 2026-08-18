const { EVENT_CATEGORIES } = require('../config/constants');

const validateCreateEvent = (data) => {
  const errors = [];
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Event title must be at least 3 characters');
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Event description must be at least 10 characters');
  }
  if (!data.category || !EVENT_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`);
  }
  if (!data.date) {
    errors.push('Event date is required');
  }
  if (!data.venue && !data.venueName) {
    errors.push('Venue details are required');
  }
  if (data.capacity && Number(data.capacity) <= 0) {
    errors.push('Capacity must be a positive number');
  }
  return errors;
};

module.exports = { validateCreateEvent };
