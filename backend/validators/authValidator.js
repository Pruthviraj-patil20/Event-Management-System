const validateRegister = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Full name is required (at least 2 characters)');
  }
  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (data.role && !['admin', 'organizer', 'attendee'].includes(data.role)) {
    errors.push('Invalid account role specified');
  }
  return errors;
};

const validateLogin = (data) => {
  const errors = [];
  if (!data.email) {
    errors.push('Email is required');
  }
  if (!data.password) {
    errors.push('Password is required');
  }
  return errors;
};

module.exports = { validateRegister, validateLogin };
