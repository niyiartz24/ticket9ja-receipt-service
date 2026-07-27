const prisma = require("../config/prisma");

/**
 * Get or create wallet
 */
exports.getOrCreate = async (departmentId) => {

    let wallet = await prisma.wallet.findUnique({
        where: {
            departmentId
        }
    });

    if (!wallet) {

        wallet = await prisma.wallet.create({

            data: {

                departmentId,

                availableBalance: 0,

                pendingBalance: 0,

                reservedBalance: 0,

                withdrawnBalance: 0,

                totalRevenue: 0

            }

        });

    }

    return wallet;

};


/**
 * Credit wallet
 */
exports.credit = async (
    departmentId,
    amount,
    reference = null,
    description = null
) => {

    return prisma.$transaction(async (tx) => {

        let wallet = await tx.wallet.findUnique({
            where: { departmentId }
        });

        if (!wallet) {

            wallet = await tx.wallet.create({
                data: {
                    departmentId,
                    availableBalance: 0,
                    pendingBalance: 0,
                    reservedBalance: 0,
                    withdrawnBalance: 0,
                    totalRevenue: 0
                }
            });

        }

        const before = Number(wallet.availableBalance);
        const after = before + Number(amount);

        const updated = await tx.wallet.update({

            where: { departmentId },

            data: {

                availableBalance: {
                    increment: amount
                },

                totalRevenue: {
                    increment: amount
                }

            }

        });

        await tx.walletHistory.create({

            data: {

                walletId: wallet.id,

                organizationId: wallet.organizationId,

                departmentId,

                type: "PAYMENT",

                amount,

                balanceBefore: before,

                balanceAfter: after,

                reference,

                description

            }

        });

        return updated;

    });

};


/**
 * Debit wallet
 */
exports.debit = async (departmentId, amount) => {

    const wallet =
        await exports.getOrCreate(departmentId);

    if (Number(wallet.availableBalance) < Number(amount)) {

        throw new Error("Insufficient balance.");

    }

    return prisma.wallet.update({

        where: {
            departmentId
        },

        data: {

            availableBalance: {
                decrement: amount
            },

            withdrawnBalance: {
                increment: amount
            }

        }

    });

};


/**
 * Reserve funds
 */
exports.reserve = async (departmentId, amount) => {

    const wallet =
        await exports.getOrCreate(departmentId);

    if (Number(wallet.availableBalance) < Number(amount)) {

        throw new Error("Insufficient balance.");

    }

    return prisma.wallet.update({

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

};


/**
 * Release funds
 */
exports.release = async (departmentId, amount) => {

    return prisma.wallet.update({

        where: {
            departmentId
        },

        data: {

            reservedBalance: {
                decrement: amount
            },

            availableBalance: {
                increment: amount
            }

        }

    });

};


/**
 * Wallet details
 */
exports.details = async (departmentId) => {

    return exports.getOrCreate(departmentId);

};