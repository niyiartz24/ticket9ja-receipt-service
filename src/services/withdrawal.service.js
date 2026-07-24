const prisma = require("../config/prisma");

function tenantScope(user) {
    switch (user.role) {

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
            throw new Error("Unauthorized.");
    }
}

function queryScope(user) {
    return user.role === "SUPER_ADMIN"
        ? {}
        : tenantScope(user);
}

/*
|--------------------------------------------------------------------------
| Request Withdrawal
|--------------------------------------------------------------------------
*/

exports.request = async (user, data) => {

    if (user.role === "SUPER_ADMIN") {
        throw new Error(
            "Super Admin cannot request withdrawals."
        );
    }

    const scope = tenantScope(user);

    const amount = Number(data.amount);

    const wallet = await prisma.wallet.findFirst({
        where: scope
    });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    const balance = Number(wallet.availableBalance);

    if (balance < amount) {
        throw new Error("Insufficient wallet balance.");
    }

    const account = await prisma.bankAccount.findFirst({

        where: {

            ...scope,

            isDefault: true

        }

    });

    if (!account) {
        throw new Error(
            "No default bank account configured."
        );
    }

    const result = await prisma.$transaction(async (tx) => {

        await tx.wallet.update({

            where: {
                id: wallet.id
            },

            data: {

                availableBalance: {
                    decrement: amount
                },

                pendingBalance: {
                    increment: amount
                }

            }

        });

        return tx.withdrawal.create({

            data: {

                walletId: wallet.id,

                amount,

                bankName: account.bankName,

                accountName: account.accountName,

                accountNumber: account.accountNumber,

                requestedBy: user.id,

                ...scope

            }

        });

    });

    return result;

};

/*
|--------------------------------------------------------------------------
| Pending Withdrawals
|--------------------------------------------------------------------------
*/

exports.getPending = async (user) => {

    const scope = queryScope(user);

    return prisma.withdrawal.findMany({

        where: {

            ...scope,

            status: "PENDING"

        },

        include: {

            organization: true,
            college: true,
            department: true

        },

        orderBy: {

            requestedAt: "desc"

        }

    });

};

/*
|--------------------------------------------------------------------------
| Withdrawal History
|--------------------------------------------------------------------------
*/

exports.getHistory = async (user) => {

    const scope = queryScope(user);

    return prisma.withdrawal.findMany({

        where: scope,

        include: {

            organization: true,
            college: true,
            department: true

        },

        orderBy: {

            requestedAt: "desc"

        }

    });

};

/*
|--------------------------------------------------------------------------
| Approve Withdrawal
|--------------------------------------------------------------------------
*/

exports.approve = async (
    withdrawalId,
    adminId
) => {

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
        throw new Error(
            "Withdrawal already processed."
        );
    }

    return prisma.$transaction(async (tx) => {

        await tx.wallet.update({

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

        return tx.withdrawal.update({

            where: {
                id: withdrawalId
            },

            data: {

                status: "APPROVED",

                approvedBy: adminId,

                approvedAt: new Date()

            }

        });

    });

};

/*
|--------------------------------------------------------------------------
| Reject Withdrawal
|--------------------------------------------------------------------------
*/

exports.reject = async (
    withdrawalId,
    adminId
) => {

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
        throw new Error(
            "Withdrawal already processed."
        );
    }

    return prisma.$transaction(async (tx) => {

        await tx.wallet.update({

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

        return tx.withdrawal.update({

            where: {
                id: withdrawalId
            },

            data: {

                status: "REJECTED",

                approvedBy: adminId,

                approvedAt: new Date()

            }

        });

    });

};