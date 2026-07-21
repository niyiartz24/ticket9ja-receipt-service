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
exports.credit = async (collegeId, amount) => {

    await exports.getOrCreate(collegeId);

    return prisma.wallet.update({

        where: {
            collegeId
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