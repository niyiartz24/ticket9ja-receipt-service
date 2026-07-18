const prisma = require("../config/prisma");

exports.requestWithdrawal = async (
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

    return prisma.collegeWithdrawal.create({

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

    return prisma.collegeWithdrawal.update({

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

    return prisma.collegeWithdrawal.update({

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

