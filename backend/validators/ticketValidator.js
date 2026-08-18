const validateTicketPurchase = (data) => {
  const errors = [];
  if (!data.eventId) {
    errors.push('Event ID is required');
  }
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one ticket item must be selected');
  }
  return errors;
};

module.exports = { validateTicketPurchase };
