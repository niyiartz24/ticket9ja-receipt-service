const paymentService = require("../services/payment.service");
const prisma = require("../config/prisma");
const { generateReceiptId } = require("../utils/receipt.util");

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

exports.verify = async (req, res) => {

    try {

        const { reference } = req.params;

        const result = await paymentService.verifyPayment(reference);

        if (!result.status || result.data.status !== "success") {
            return res.status(400).json({
                success: false,
                message: "Payment not successful"
            });
        }

        // Prevent duplicates
        const existing = await prisma.transaction.findUnique({
            where: {
                reference
            }
        });

        if (existing) {
            return res.json({
                success: true,
                receipt: existing
            });
        }

        // Receipt Number
        const receiptNumber =
            `T9J-${new Date().getFullYear()}-${Date.now()}`;

        const receipt = await prisma.transaction.create({
    data: {
        receiptId: generateReceiptId(),

        reference: result.data.reference,

        customerName: "",

        email: result.customer.email,

        amount: Number(result.data.amount),

        currency: result.data.currency,

        paymentStatus: result.data.status,

        paymentDate: new Date()
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