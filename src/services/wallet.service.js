const prisma = require("../config/prisma");

exports.createWallet = async (organizationId) => {

    const existing =
        await prisma.wallet.findUnique({

            where: {
                organizationId
            }

        });

    if (existing) {

        return existing;

    }

    return await prisma.wallet.create({

        data: {

            organizationId,

            availableBalance: 0,

            pendingBalance: 0,

            reservedBalance: 0,

            withdrawnBalance: 0,

            totalRevenue: 0

        }

    });

};

exports.getWallet = async (organizationId) => {

    const wallet =
        await prisma.wallet.findUnique({

            where: {
                organizationId
            }

        });

    if (!wallet) {

        return await exports.createWallet(
            organizationId
        );

    }

    return wallet;

};

exports.creditWallet = async (
    organizationId,
    amount
) => {

    await exports.getWallet(
        organizationId
    );

    return await prisma.wallet.update({

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

exports.debitWallet = async (
    organizationId,
    amount
) => {

    const wallet =
        await exports.getWallet(
            organizationId
        );

    if (
        wallet.availableBalance < amount
    ) {

        throw new Error(
            "Insufficient wallet balance."
        );

    }

    return await prisma.wallet.update({

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

exports.reserveFunds = async (
    organizationId,
    amount
) => {

    const wallet =
        await exports.getWallet(
            organizationId
        );

    if (
        wallet.availableBalance < amount
    ) {

        throw new Error(
            "Insufficient wallet balance."
        );

    }

    return await prisma.wallet.update({

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

exports.releaseFunds = async (
    organizationId,
    amount
) => {

    return await prisma.wallet.update({

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

exports.completeWithdrawal = async (
    organizationId,
    amount
) => {

    return await prisma.wallet.update({

        where: {
            organizationId
        },

        data: {

            reservedBalance: {

                decrement: amount

            },

            withdrawnBalance: {

                increment: amount

            }

        }

    });

};