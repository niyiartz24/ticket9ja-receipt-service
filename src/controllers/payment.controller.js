const paymentService = require("../services/payment.service");

exports.initiate = async (req, res) => {
    try {
        const response = await paymentService.initialize(req.body);

        return res.redirect(response.data.authorization_url);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};