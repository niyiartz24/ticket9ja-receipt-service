const prisma = require("../config/prisma");

exports.requestWithdrawal = async (
    departmentId,
    amount
) => {

    const wallet =
        await prisma.departmentWallet.findUnique({

            where: {
                departmentId
            }

        });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    if (Number(wallet.availableBalance) < amount) {
        throw new Error("Insufficient balance.");
    }

    const bank =
        await prisma.departmentBankAccount.findFirst({

            where: {
                departmentId
            }

        });

    if (!bank) {
        throw new Error(
            "No bank account configured."
        );
    }

    await prisma.departmentWallet.update({

        where: {
            departmentId
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

    return prisma.departmentWithdrawal.create({

        data: {

            departmentId,

            walletId: wallet.id,

            amount,

            bankName: bank.bankName,

            accountNumber: bank.accountNumber,

            accountName: bank.accountName,

            requestedBy: departmentId

        }

    });

};

exports.getPending = async () => {

    return prisma.departmentWithdrawal.findMany({

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
    departmentId
) => {

    return prisma.departmentWithdrawal.findMany({

        where: {
            departmentId
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
        await prisma.departmentWithdrawal.findUnique({

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

    await prisma.departmentWallet.update({

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

    return prisma.departmentWithdrawal.update({

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
        await prisma.departmentWithdrawal.findUnique({

            where: {
                id: withdrawalId
            }

        });

    if (!withdrawal) {
        throw new Error("Withdrawal not found.");
    }

    await prisma.departmentWallet.update({

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

    return prisma.departmentWithdrawal.update({

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

