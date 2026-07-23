const prisma = require("../config/prisma");

function buildScope(user) {

    switch (user.role) {

        case "SUPER_ADMIN":
            return {};

        case "ORGANIZATION_ADMIN":
            return {
                organizationId: user.organizationId
            };

        case "COLLEGE_ADMIN":
            return {
                collegeId: user.collegeId
            };

        case "DEPARTMENT_ADMIN":
            return {
                departmentId: user.departmentId
            };

        default:
            return {};
    }

}function buildScope(user) {

    switch (user.role) {

        case "SUPER_ADMIN":
            return {};

        case "ORGANIZATION_ADMIN":
            return {
                organizationId: user.organizationId
            };

        case "COLLEGE_ADMIN":
            return {
                collegeId: user.collegeId
            };

        case "DEPARTMENT_ADMIN":
            return {
                departmentId: user.departmentId
            };

        default:
            return {};
    }

}

exports.request = async (data) => {

    const wallet = await prisma.wallet.findUnique({
        where: {
            organizationId: data.organizationId
        }
    });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    if (wallet.availableBalance < data.amount) {
        throw new Error("Insufficient wallet balance.");
    }

    const account = await prisma.bankAccount.findUnique({
        where: {
            id: data.bankAccountId
        }
    });

    if (!account) {
        throw new Error("Bank account not found.");
    }

    if (account.organizationId !== data.organizationId) {
        throw new Error("Invalid bank account.");
    }

    await prisma.wallet.update({

        where: {
            id: wallet.id
        },

        data: {

            availableBalance: {
                decrement: data.amount
            },

            pendingBalance: {
                increment: data.amount
            }

        }

    });

    return await prisma.withdrawal.create({

        data: {

            walletId: wallet.id,

            organizationId: data.organizationId,

            amount: data.amount,

            bankName: account.bankName,

            accountName: account.accountName,

            accountNumber: account.accountNumber,

            requestedBy: data.requestedBy

        }

    });

};

exports.getPending = async (user) => {

    const scope = buildScope(user);

    return prisma.withdrawal.findMany({

        where: {
            ...scope,
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

exports.getHistory = async (user) => {

    const scope = buildScope(user);

    return prisma.withdrawal.findMany({

        where: scope,

        orderBy: {
            requestedAt: "desc"
        }

    });

};

exports.approve = async (withdrawalId, adminId) => {

    const withdrawal = await prisma.withdrawal.findUnique({

        where: {
            id: withdrawalId
        },

        include: {
            wallet: true
        }

    });

    if (!withdrawal) {
        throw new Error("Withdrawal not found.");
    }

    if (withdrawal.status !== "PENDING") {
        throw new Error("Withdrawal already processed.");
    }

    await prisma.wallet.update({

        where: {
            id: withdrawal.walletId
        },

        data: {

            pendingBalance: {
                decrement: withdrawal.amount
            },

            withdrawnBalance: {
                increment: withdrawal.amount
            }

        }

    });

    return prisma.withdrawal.update({

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

exports.reject = async (withdrawalId, adminId) => {

    const withdrawal = await prisma.withdrawal.findUnique({

        where: {
            id: withdrawalId
        },

        include: {
            wallet: true
        }

    });

    if (!withdrawal) {
        throw new Error("Withdrawal not found.");
    }

    if (withdrawal.status !== "PENDING") {
        throw new Error("Withdrawal already processed.");
    }

    await prisma.wallet.update({

        where: {
            id: withdrawal.walletId
        },

        data: {

            pendingBalance: {
                decrement: withdrawal.amount
            },

            availableBalance: {
                increment: withdrawal.amount
            }

        }

    });

    return prisma.withdrawal.update({

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