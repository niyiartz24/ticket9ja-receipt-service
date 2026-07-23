const prisma = require("../config/prisma");
const notificationService = require("./notification.service");

exports.request = async (
    collegeId,
    amount
) => {

    const wallet =
        await prisma.collegeWallet.findUnique({

            where: {
                collegeId
            }

        });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    if (Number(wallet.availableBalance) < amount) {
        throw new Error("Insufficient balance.");
    }

    const bank =
        await prisma.collegeBankAccount.findFirst({

            where: {
                collegeId
            }

        });

    if (!bank) {
        throw new Error(
            "No bank account configured."
        );
    }

    await prisma.collegeWallet.update({

        where: {
            collegeId
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
await prisma.collegeWithdrawal.create({

    data: {

        collegeId,

        walletId: wallet.id,

        amount,

        bankName: bank.bankName,

        accountNumber: bank.accountNumber,

        accountName: bank.accountName,

        requestedBy: collegeId

    }

});

await notificationService.create({

    type: "WARNING",

    title: "Withdrawal Requested",

    message: `A withdrawal request of ₦${amount} has been submitted.`,

    organizationId: withdrawal.organizationId,

    collegeId: withdrawal.collegeId

});

return withdrawal;

};

exports.getPending = async () => {

    return prisma.collegeWithdrawal.findMany({

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
    collegeId
) => {

    return prisma.collegeWithdrawal.findMany({

        where: {
            collegeId
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
        await prisma.collegeWithdrawal.findUnique({

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

    await prisma.collegeWallet.update({

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
await prisma.collegeWithdrawal.update({

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

    organizationId: withdrawal.organizationId,

    collegeId: withdrawal.collegeId

});

return approved;

};

exports.reject = async (
    withdrawalId,
    adminId
) => {

    const withdrawal =
        await prisma.collegeWithdrawal.findUnique({

            where: {
                id: withdrawalId
            }

        });

    if (!withdrawal) {
        throw new Error("Withdrawal not found.");
    }

    await prisma.collegeWallet.update({

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
await prisma.collegeWithdrawal.update({

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

    organizationId: withdrawal.organizationId,

    collegeId: withdrawal.collegeId

});

return rejected;

};

