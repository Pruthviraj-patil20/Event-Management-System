const validateProfileUpdate = (data) => {
  const errors = [];
  if (data.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }
  return errors;
};

module.exports = { validateProfileUpdate };
