
const prisma = require("../config/prisma");


exports.searchReceipt = async (req, res) => {

    const { email, reference, invoiceNumber } = req.body;

    const receipt = await prisma.transaction.findFirst({
        where: {
            OR: [
                email ? { email } : undefined,
                reference ? { reference } : undefined,
                invoiceNumber ? { invoiceNumber } : undefined
            ].filter(Boolean)
        }
    });

    if (!receipt) {

        return res.status(404).json({
            success: false,
            message: "Receipt not found"
        });

    }

    return res.json({
        success: true,
        receipt
    });

};

exports.getReceipt = async (req, res) => {
    try {

        const receipt = await prisma.transaction.findUnique({
            where: {
                receiptId: req.params.receiptId
            }
        });

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: "Receipt not found"
            });
        }

        return res.json({
            success: true,
            receipt
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.downloadPDF = async (req, res) => {

    res.json({
        message: "PDF endpoint"
    });

};

exports.emailReceipt = async (req, res) => {

    res.json({
        message: "Email endpoint"
    });

};