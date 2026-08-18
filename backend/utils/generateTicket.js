const crypto = require('crypto');

/**
 * Generates a unique, formatted Ticket Number (e.g. ESP-2026-9A8B7C)
 */
const generateTicketNumber = () => {
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `ESP-${year}-${randomSuffix}`;
};

/**
 * Generates a unique Registration/Order Number (e.g. REG-892183)
 */
const generateRegistrationNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REG-${random}`;
};

/**
 * Generates a unique Transaction ID (e.g. TXN-1740000000-A7F2)
 */
const generateTransactionId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TXN-${ts}-${rand}`;
};

module.exports = {
  generateTicketNumber,
  generateRegistrationNumber,
  generateTransactionId
};
