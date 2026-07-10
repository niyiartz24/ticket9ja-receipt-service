
const prisma = require("../config/prisma");

const receiptTemplate = require("../templates/receipt.template");
const pdfService = require("../services/pdf.service");
const emailService = require("../services/email.service");


exports.searchReceipt = async (req, res) => {
    try {
        const { email, reference, receiptId } = req.body;

        // Search by email → return ALL receipts
        if (email) {
            const receipts = await prisma.transaction.findMany({
                where: {
                    email: email.trim().toLowerCase()
                },
                orderBy: {
                    paymentDate: "desc"
                }
            });

            if (!receipts.length) {
                return res.status(404).json({
                    success: false,
                    message: "No receipts found."
                });
            }

            return res.json({
                success: true,
                receipts
            });
        }

        // Search by reference or receiptId → return one receipt
        const receipt = await prisma.transaction.findFirst({
            where: {
                OR: [
                    reference ? { reference } : undefined,
                    receiptId ? { receiptId } : undefined
                ].filter(Boolean)
            }
        });

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: "Receipt not found."
            });
        }

        return res.json({
            success: true,
            receipt
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getReceipt = async (req, res) => {
    try {

        const receipt = await prisma.transaction.findUnique({
    where: {
        receiptId: req.params.receiptId
    },
    include: {
        organization: {
            include: {
                receiptTemplate: true
            }
        },
        department: true,
        paymentType: true,
        session: true
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

exports.viewReceipt = async (req, res) => {

    try {

        const receipt = await prisma.transaction.findUnique({
    where: {
        receiptId: req.params.receiptId
    },
    include: {
        organization: {
            include: {
                receiptTemplate: true
            }
        },
        department: true,
        paymentType: true,
        session: true
    }
});

        if (!receipt) {
            return res.status(404).send("Receipt not found");
        }

        const html =
    await receiptTemplate(receipt);

res.send(html);

    } catch (error) {

        res.status(500).send(error.message);

    }

};

exports.downloadPDF = async (req, res) => {

    try {

        const receipt = await prisma.transaction.findUnique({
    where: {
        receiptId: req.params.receiptId
    },
    include: {
        organization: {
            include: {
                receiptTemplate: true
            }
        },
        department: true,
        paymentType: true,
        session: true
    }
});

        if (!receipt) {

            return res.status(404).json({

                success: false,
                message: "Receipt not found"

            });

        }

        const html = await receiptTemplate(receipt);

        const pdf = await pdfService.generatePDF(html);

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${receipt.receiptId}.pdf"`
        );

        return res.send(pdf);

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

exports.emailReceipt = async (req, res) => {

    try {

        const receipt = await prisma.transaction.findUnique({
    where: {
        receiptId: req.params.receiptId
    },
    include: {
        organization: {
            include: {
                receiptTemplate: true
            }
        },
        department: true,
        paymentType: true,
        session: true
    }
});

        if (!receipt) {

            return res.status(404).json({

                success: false,

                message: "Receipt not found"

            });

        }

        const html =
            await receiptTemplate(receipt);

        const pdf =
            await pdfService.generatePDF(html);

        await emailService.sendReceipt({

            receipt,

            pdf

        });

        await prisma.transaction.update({

            where: {

                receiptId: receipt.receiptId

            },

            data: {

                receiptSent: true

            }

        });

        return res.json({

            success: true,

            message: "Receipt emailed successfully."

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};