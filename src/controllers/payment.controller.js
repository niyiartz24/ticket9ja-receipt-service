const paymentService = require("../services/payment.service");
const prisma = require("../config/prisma");

exports.initiate = async (req, res) => {
    try {

        const result = await paymentService.initialize(req.body);

        return res.json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.verify = async (req, res) => {

    try {

        const { reference } = req.params;

        // Verify payment with BudPay
        const result = await paymentService.verifyPayment(reference);

        // Payment failed
        if (!result.status || result.data.status !== "success") {

            await prisma.transaction.update({
                where: {
                    reference
                },
                data: {
                    paymentStatus: "failed"
                }
            });

            return res.status(400).json({
                success: false,
                message: "Payment not successful"
            });

        }

        // Complete payment (updates transaction, generates receipt, sends email)
        const receipt = await paymentService.completePayment(
            reference,
            result
        );

        return res.json({
            success: true,
            receipt
        });

    } catch (error) {

        console.error(error.response?.data || error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};