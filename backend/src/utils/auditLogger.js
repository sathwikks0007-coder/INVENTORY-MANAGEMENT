const AuditLog = require('../models/AuditLog');

const logAudit = async (user, action, resource, resourceId = '', details = '', ipAddress = '') => {
  try {
    await AuditLog.create({
      user: user?._id || null,
      userName: user?.name || 'System/Guest',
      userRole: user?.role || 'Guest',
      action,
      resource,
      resourceId,
      details,
      ipAddress
    });
  } catch (error) {
    console.error(`[Audit Log Failed]: ${error.message}`);
  }
};

module.exports = { logAudit };
