const { ROLES } = require('../config/constants');

/**
 * Restricts access to specific roles
 * @param  {...String} roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to perform this action.`
      });
    }

    next();
  };
};

module.exports = { authorize, ROLES };
