
const prisma = require("../config/prisma");

const receiptTemplate = require("../templates/receipt.template");
const pdfService = require("../services/pdf.service");
const emailService = require("../services/email.service");


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