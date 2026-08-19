const AdminActivity = require('../models/AdminActivity');

/**
 * Log an admin action to the activity audit trail.
 * Never throws — failures must not break the main request flow.
 */
const logActivity = async ({
  admin,
  action,
  targetType = '',
  targetId = '',
  targetLabel = '',
  details = '',
  ip = '',
  status = 'success'
}) => {
  try {
    await AdminActivity.create({
      admin: admin._id || admin,
      adminName: admin.name || '',
      action,
      targetType,
      targetId: targetId ? String(targetId) : '',
      targetLabel: targetLabel || '',
      details: details || '',
      ip: ip || '',
      status
    });
  } catch (err) {
    // Intentionally swallowed — audit logging must be best-effort.
  }
};

module.exports = { logActivity };