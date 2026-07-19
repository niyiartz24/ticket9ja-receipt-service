const axios = require("axios");
const prisma = require("../config/prisma");
const { generateReceiptId } = require("../utils/receipt.util");
const receiptTemplate = require("../templates/receipt.template");
const pdfService = require("./pdf.service");
const emailService = require("./email.service");
const organizationWallet = require("./organizationWallet.service");
const collegeWallet = require("./collegeWallet.service");
const departmentWallet = require("./departmentWallet.service");
const feeService = require("./fee.service");
const notificationService = require("./notification.service");

/**
 * Initialize a payment
 */
exports.initialize = async (paymentData) => {

    const paymentType = await prisma.paymentType.findUnique({
        where: {
            id: paymentData.paymentTypeId
        }
    });

    if (!paymentType) {
        throw new Error("Invalid payment type.");
    }

    const organizationId = paymentType.organizationId;

    const collegeId = paymentType.collegeId || null;

    const departmentId = paymentType.departmentId || null;

    // Validate organization
    const organization = await prisma.organization.findUnique({
    where: {
        id: organizationId
    }
        });

    if (!organization) {
    throw new Error("Invalid organization.");
    }

    // Validate department (optional)
    if (departmentId) {

    const department = await prisma.department.findFirst({
        where: {
            id: departmentId,
            organizationId
        }
    });

    if (!department) {
        throw new Error("Invalid department.");
    }

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

    

    const pricing =
    await feeService.calculate(
        paymentType.defaultAmount
    );

    const amount = pricing.amount;
    const platformFee = pricing.fee;
    const grossAmount = pricing.total;
    const netAmount = Number(
    (grossAmount - platformFee).toFixed(2)
    );

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

        platformFee,

        grossAmount,

        netAmount,

        currency: "NGN",

        paymentStatus: "PENDING",

        description: paymentType.title,

        organizationId,

        collegeId,

        departmentId,

        paymentTypeId: paymentData.paymentTypeId,

        sessionId: session.id

    }

});

    const payload = {

        email: paymentData.email,

        amount: String(grossAmount),

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

        return {

    ...response.data,

    pricing: {

        amount,

        platformFee,

        grossAmount

    }

};

    } catch (error) {

        // Mark transaction as failed if BudPay initialization fails
        await prisma.transaction.update({

            where: {

                reference

            },

            data: {

                paymentStatus: "FAILED"

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
    if (existing.paymentStatus === "SUCCESSFUL") {

    return existing;

}

    const transaction = await prisma.transaction.update({

    where: {
        reference
    },

    data: {

        paymentStatus: "SUCCESSFUL",

        paymentDate: new Date(),

        paymentMethod:
            verification.data.channel || "BudPay"

    }

});

if (transaction.departmentId) {

    await departmentWallet.credit(
        transaction.departmentId,
        Number(transaction.netAmount)
    );

} else if (transaction.collegeId) {

    await collegeWallet.credit(
        transaction.collegeId,
        Number(transaction.netAmount)
    );

} else {

    await organizationWallet.credit(
        transaction.organizationId,
        Number(transaction.netAmount)
    );

}

await notificationService.create({

    organizationId: transaction.organizationId,

    collegeId: transaction.collegeId,

    departmentId: transaction.departmentId,

    type: "SUCCESS",

    title: "Payment Received",

    message: `₦${transaction.grossAmount} received from ${transaction.payerName}.`

});

    const receipt = await prisma.transaction.findUnique({
        where: {
            reference
        },
        include: {
    organization: true,
    college: true,
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