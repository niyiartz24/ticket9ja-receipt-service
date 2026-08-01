const authService = require('./auth.service');
const auditLogService = require('../services/auditLog.service');

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    await auditLogService.log({
      userId: result.user?.id || null,
      action: 'LOGIN',
      entity: 'AUTH',
      metadata: {
        target: result.user?.email || req.body.email || null,
        ip: req.ip,
        userAgent: req.get('user-agent') || null
      }
    });

    return res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.me = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};