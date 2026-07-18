const authService = require('./auth.service');

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

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