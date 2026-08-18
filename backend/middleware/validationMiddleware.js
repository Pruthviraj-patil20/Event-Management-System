/**
 * Request validation runner
 * @param {Function} validatorFn
 */
const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.body, req);
    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }
    next();
  };
};

module.exports = { validate };
