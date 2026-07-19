const prisma = require("../config/prisma");
const notificationService = require("./notification.service");

exports.requestWithdrawal = async (
    organizationId,
    amount
) => {

    const wallet =
        await prisma.organizationWallet.findUnique({

            where: {
                organizationId
            }

        });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    if (Number(wallet.availableBalance) < amount) {
        throw new Error("Insufficient balance.");
    }

    const bank =
        await prisma.organizationBankAccount.findFirst({

            where: {
                organizationId
            }

        });

    if (!bank) {
        throw new Error(
            "No bank account configured."
        );
    }

    await prisma.organizationWallet.update({

        where: {
            organizationId
        },

        data: {

            availableBalance: {
                decrement: amount
            },

            reservedBalance: {
                increment: amount
            }

        }

    });

    const withdrawal =
await prisma.organizationWithdrawal.create({

    data: {

        organizationId,

        walletId: wallet.id,

        amount,

        bankName: bank.bankName,

        accountNumber: bank.accountNumber,

        accountName: bank.accountName,

        requestedBy: organizationId

    }

});

await notificationService.create({

    type: "WARNING",

    title: "Withdrawal Requested",

    message: `A withdrawal request of ₦${amount} has been submitted.`,

    organizationId

});

return withdrawal;

};

exports.getPending = async () => {

    return prisma.organizationWithdrawal.findMany({

        where: {
            status: "PENDING"
        },

        include: {

            organization: true

        },

        orderBy: {

            requestedAt: "desc"

        }

    });

};

exports.getHistory = async (
    organizationId
) => {

    return prisma.organizationWithdrawal.findMany({

        where: {
            organizationId
        },

        orderBy: {

            requestedAt: "desc"

        }

    });

};

exports.approve = async (
    withdrawalId,
    adminId
) => {

    const withdrawal =
        await prisma.organizationWithdrawal.findUnique({

            where: {
                id: withdrawalId
            }

        });

    if (!withdrawal) {
        throw new Error("Withdrawal not found.");
    }

    if (withdrawal.status !== "PENDING") {
        throw new Error(
            "Already processed."
        );
    }

    await prisma.organizationWallet.update({

        where: {

            id: withdrawal.walletId

        },

        data: {

            reservedBalance: {
                decrement: withdrawal.amount
            },

            withdrawnBalance: {
                increment: withdrawal.amount
            }

        }

    });

    const approved =
await prisma.organizationWithdrawal.update({

    where: {

        id: withdrawalId

    },

    data: {

        status: "APPROVED",

        approvedBy: adminId,

        approvedAt: new Date()

    }

});

await notificationService.create({

    type: "SUCCESS",

    title: "Withdrawal Approved",

    message: `Withdrawal of ₦${withdrawal.amount} has been approved.`,

    organizationId: withdrawal.organizationId

});

return approved;

};

exports.reject = async (
    withdrawalId,
    adminId
) => {

    const withdrawal =
        await prisma.organizationWithdrawal.findUnique({

            where: {
                id: withdrawalId
            }

        });

    if (!withdrawal) {
        throw new Error("Withdrawal not found.");
    }

    await prisma.organizationWallet.update({

        where: {

            id: withdrawal.walletId

        },

        data: {

            reservedBalance: {
                decrement: withdrawal.amount
            },

            availableBalance: {
                increment: withdrawal.amount
            }

        }

    });

    const rejected =
await prisma.organizationWithdrawal.update({

    where: {

        id: withdrawalId

    },

    data: {

        status: "REJECTED",

        approvedBy: adminId,

        approvedAt: new Date()

    }

});

await notificationService.create({

    type: "ERROR",

    title: "Withdrawal Rejected",

    message: `Withdrawal of ₦${withdrawal.amount} has been rejected.`,

    organizationId: withdrawal.organizationId

});

return rejected;

};

