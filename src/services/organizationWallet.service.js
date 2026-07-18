const prisma = require("../config/prisma");

/**
 * Create wallet automatically
 */
exports.getOrCreate = async (organizationId) => {

    let wallet =
        await prisma.organizationWallet.findUnique({
            where: {
                organizationId
            }
        });

    if (!wallet) {

        wallet =
            await prisma.organizationWallet.create({

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
 * Credit wallet
 */
exports.credit = async (organizationId, amount) => {

    await exports.getOrCreate(organizationId);

    return prisma.organizationWallet.update({

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

};


/**
 * Debit wallet
 */
exports.debit = async (organizationId, amount) => {

    const wallet =
        await exports.getOrCreate(organizationId);

    if (Number(wallet.availableBalance) < Number(amount)) {

        throw new Error("Insufficient balance.");

    }

    return prisma.organizationWallet.update({

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

};


/**
 * Reserve funds
 */
exports.reserve = async (organizationId, amount) => {

    const wallet =
        await exports.getOrCreate(organizationId);

    if (Number(wallet.availableBalance) < Number(amount)) {

        throw new Error("Insufficient balance.");

    }

    return prisma.organizationWallet.update({

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

};


/**
 * Release reserved funds
 */
exports.release = async (organizationId, amount) => {

    return prisma.organizationWallet.update({

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

};


/**
 * Wallet Details
 */
exports.details = async (organizationId) => {

    return exports.getOrCreate(organizationId);

};