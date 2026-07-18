const prisma = require("../config/prisma");

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

    return prisma.organizationWithdrawal.create({

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

    return prisma.organizationWithdrawal.update({

        where: {

            id: withdrawalId

        },

        data: {

            status: "APPROVED",

            approvedBy: adminId,

            approvedAt: new Date()

        }

    });

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

    return prisma.organizationWithdrawal.update({

        where: {

            id: withdrawalId

        },

        data: {

            status: "REJECTED",

            approvedBy: adminId,

            approvedAt: new Date()

        }

    });

};

