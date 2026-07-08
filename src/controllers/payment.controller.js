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

        // Update pending transaction
        await prisma.transaction.update({

            where: {
                reference
            },

            data: {

                paymentStatus: "success",

                paymentDate: new Date(),

                transactionId: String(result.data.id),

                paymentMethod: result.data.channel || "BudPay"

            }

        });

        // Fetch updated receipt
        const receipt = await prisma.transaction.findUnique({

            where: {
                reference
            },

            include: {

                organization: true,

                department: true,

                paymentType: true,

                session: true

            }

        });

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