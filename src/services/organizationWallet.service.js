const prisma = require("../config/prisma");

/**
 * Get or create organization wallet
 */
exports.getOrCreate = async (tx, organizationId) => {

    let wallet = await tx.wallet.findUnique({
        where: { organizationId }
    });

    if (!wallet) {

        wallet = await tx.wallet.create({

            data: {

                organizationId,

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
 * Wallet Details
 */
exports.details = async (organizationId) => {

    return prisma.$transaction(async (tx) => {

        return exports.getOrCreate(tx, organizationId);

    });

};


/**
 * Credit wallet
 */
exports.credit = async ({
    organizationId,
    amount,
    reference = null,
    description = null
}) => {

    return prisma.$transaction(async (tx) => {

        const wallet =
            await exports.getOrCreate(tx, organizationId);

        const before =
            Number(wallet.availableBalance);

        const after =
            before + Number(amount);

        const updatedWallet =
            await tx.wallet.update({

                where: {
                    organizationId
                },

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

                organizationId,

                type: "PAYMENT",

                amount,

                balanceBefore: before,

                balanceAfter: after,

                reference,

                description

            }

        });

        return updatedWallet;

    });

};


/**
 * Debit wallet
 */
exports.debit = async ({
    organizationId,
    amount,
    reference = null,
    description = null
}) => {

    return prisma.$transaction(async (tx) => {

        const wallet =
            await exports.getOrCreate(tx, organizationId);

        const before =
            Number(wallet.availableBalance);

        if (before < Number(amount)) {

            throw new Error("Insufficient balance.");

        }

        const after =
            before - Number(amount);

        const updatedWallet =
            await tx.wallet.update({

                where: {
                    organizationId
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

        await tx.walletHistory.create({

            data: {

                walletId: wallet.id,

                organizationId,

                type: "WITHDRAWAL",

                amount,

                balanceBefore: before,

                balanceAfter: after,

                reference,

                description

            }

        });

        return updatedWallet;

    });

};


/**
 * Reserve funds
 */
exports.reserve = async ({
    organizationId,
    amount,
    reference = null,
    description = null
}) => {

    return prisma.$transaction(async (tx) => {

        const wallet =
            await exports.getOrCreate(tx, organizationId);

        const before =
            Number(wallet.availableBalance);

        if (before < Number(amount)) {

            throw new Error("Insufficient balance.");

        }

        const after =
            before - Number(amount);

        const updatedWallet =
            await tx.wallet.update({

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

        await tx.walletHistory.create({

            data: {

                walletId: wallet.id,

                organizationId,

                type: "RESERVE",

                amount,

                balanceBefore: before,

                balanceAfter: after,

                reference,

                description

            }

        });

        return updatedWallet;

    });

};


/**
 * Release reserved funds
 */
exports.release = async ({
    organizationId,
    amount,
    reference = null,
    description = null
}) => {

    return prisma.$transaction(async (tx) => {

        const wallet =
            await exports.getOrCreate(tx, organizationId);

        const before =
            Number(wallet.availableBalance);

        const after =
            before + Number(amount);

        const updatedWallet =
            await tx.wallet.update({

                where: {
                    organizationId
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

        await tx.walletHistory.create({

            data: {

                walletId: wallet.id,

                organizationId,

                type: "RELEASE",

                amount,

                balanceBefore: before,

                balanceAfter: after,

                reference,

                description

            }

        });

        return updatedWallet;

    });

};