const paymentService = require("../services/payment.service");

exports.initiate = async (req, res) => {
  try {
    const result = await paymentService.initialize(req.body);

    return res.json(result);

  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};