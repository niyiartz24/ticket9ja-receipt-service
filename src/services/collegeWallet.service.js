const prisma = require("../config/prisma");

/**
 * Get or create wallet
 */
exports.getOrCreate = async (collegeId) => {

    let wallet = await prisma.wallet.findUnique({
        where: {
            collegeId
        }
    });

    if (!wallet) {

        wallet = await prisma.wallet.create({

            data: {

                collegeId,

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
    collegeId,
    amount,
    reference = null,
    description = null
) => {

    return prisma.$transaction(async (tx) => {

        let wallet = await tx.wallet.findUnique({
            where: { collegeId }
        });

        if (!wallet) {
            wallet = await tx.wallet.create({
                data: {
                    collegeId,
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
            where: { collegeId },
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
                collegeId,
                departmentId: null,
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
exports.debit = async (collegeId, amount) => {

    const wallet =
        await exports.getOrCreate(collegeId);

    if (Number(wallet.availableBalance) < Number(amount)) {

        throw new Error("Insufficient balance.");

    }

    return prisma.wallet.update({

        where: {
            collegeId
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
exports.reserve = async (collegeId, amount) => {

    const wallet =
        await exports.getOrCreate(collegeId);

    if (Number(wallet.availableBalance) < Number(amount)) {

        throw new Error("Insufficient balance.");

    }

    return prisma.wallet.update({

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

};


/**
 * Release funds
 */
exports.release = async (collegeId, amount) => {

    return prisma.wallet.update({

        where: {
            collegeId
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
exports.details = async (collegeId) => {

    return exports.getOrCreate(collegeId);

};