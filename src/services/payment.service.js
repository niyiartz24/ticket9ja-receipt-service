const axios = require("axios");
const prisma = require("../config/prisma");
const { generateReceiptId } = require("../utils/receipt.util");
const receiptTemplate = require("../templates/receipt.template");
const pdfService = require("./pdf.service");
const emailService = require("./email.service");

/**
 * Initialize a payment
 */
exports.initialize = async (paymentData) => {

    // Validate organization
    const organization = await prisma.organization.findUnique({
        where: {
            id: paymentData.organizationId
        }
    });

    if (!organization) {
        throw new Error("Invalid organization.");
    }

    // Validate department (optional)
    if (paymentData.departmentId) {

        const department = await prisma.department.findFirst({
            where: {
                id: paymentData.departmentId,
                organizationId: paymentData.organizationId
            }
        });

        if (!department) {
            throw new Error("Invalid department.");
        }

    }

    // Validate payment type
    const paymentType = await prisma.paymentType.findUnique({
        where: {
            id: paymentData.paymentTypeId
        }
    });

    if (!paymentType) {
        throw new Error("Invalid payment type.");
    }

    // Ensure payment type belongs to organization
    if (paymentType.organizationId !== paymentData.organizationId) {
        throw new Error("Payment type does not belong to the selected organization.");
    }

    // Validate amount
    if (paymentType.defaultAmount == null) {
        throw new Error("This payment type has no configured amount.");
    }

    // Get active academic session
    const session = await prisma.academicSession.findFirst({
        where: {
            active: true
        }
    });

    if (!session) {
        throw new Error("No active academic session.");
    }

    const amount = paymentType.defaultAmount;

    const crypto = require("crypto");

const reference = `TKT9JA-${crypto.randomUUID()}`;

    // Create pending transaction
    await prisma.transaction.create({

        data: {

            receiptId: generateReceiptId(),

            reference,

            payerName: paymentData.payerName,

            email: paymentData.email,

            phone: paymentData.phone || null,

            matricNumber: paymentData.matricNumber || null,

            level: paymentData.level || null,

            amount,

            currency: "NGN",

            paymentStatus: "pending",

            description: paymentType.title,

            organizationId: paymentData.organizationId,

            departmentId: paymentData.departmentId || null,

            paymentTypeId: paymentData.paymentTypeId,

            sessionId: session.id

        }

    });

    const payload = {

        email: paymentData.email,

        amount: String(amount),

        currency: "NGN",

        reference,

        callback: `https://ticket9japay.vercel.app/success.html?reference=${reference}`

    };

    try {

        const response = await axios.post(

            "https://api.budpay.com/api/v2/transaction/initialize",

            payload,

            {

                headers: {

                    Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}`,

                    "Content-Type": "application/json"

                }

            }

        );

        return response.data;

    } catch (error) {

        // Mark transaction as failed if BudPay initialization fails
        await prisma.transaction.update({

            where: {

                reference

            },

            data: {

                paymentStatus: "failed"

            }

        });

        console.error(error.response?.data || error.message);

        throw new Error(
            error.response?.data?.message ||
            "Unable to initialize payment."
        );

    }

};


/**
 * Verify a payment
 */
exports.verifyPayment = async (reference) => {

    try {

        const response = await axios.get(

            `https://api.budpay.com/api/v2/transaction/verify/${reference}`,

            {

                headers: {

                    Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}`,

                    "Content-Type": "application/json"

                }

            }

        );

        return response.data;

    } catch (error) {

        console.error(error.response?.data || error.message);

        throw new Error(
            error.response?.data?.message ||
            "Payment verification failed."
        );

    }

};

exports.completePayment = async (reference, verification) => {

    const existing = await prisma.transaction.findUnique({
        where: { reference }
    });

    if (!existing) {
        throw new Error("Transaction not found.");
    }

    // Already processed
    if (
        existing.paymentStatus === "successful" &&
        existing.receiptSent
    ) {
        return existing;
    }

    await prisma.transaction.update({
        where: {
            reference
        },
        data: {
            paymentStatus: "successful",
            paymentDate: new Date(),
            paymentMethod: verification.data.channel || "BudPay"
        }
    });

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

    if (!receipt.receiptSent) {

        const html = await receiptTemplate(receipt);

        const pdf = await pdfService.generatePDF(html);

        await emailService.sendReceipt({
            receipt,
            pdf
        });

        await prisma.transaction.update({
            where: {
                reference
            },
            data: {
                receiptSent: true
            }
        });

        receipt.receiptSent = true;
    }

    return receipt;

};