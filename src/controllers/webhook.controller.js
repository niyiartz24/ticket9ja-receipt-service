const budpayService = require("../services/budpay.service");

exports.handleWebhook = async (req, res) => {
    try {
        await budpayService.processWebhook(req);

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};