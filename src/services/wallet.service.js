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

exports.creditWallet = async ({
    organizationId,
    collegeId = null,
    departmentId = null,
    amount,
    reference = null,
    description = null
}) => {

    return await prisma.$transaction(async (tx) => {

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

        const before = Number(wallet.availableBalance);
        const after = before + Number(amount);

        const updated = await tx.wallet.update({
            where: { organizationId },
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
                collegeId,
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

exports.debitWallet = async ({
    organizationId,
    collegeId = null,
    departmentId = null,
    amount,
    reference = null,
    description = null
}) => {

    return await prisma.$transaction(async (tx) => {

        const wallet = await tx.wallet.findUnique({
            where: { organizationId }
        });

        if (!wallet)
            throw new Error("Wallet not found.");

        const before = Number(wallet.availableBalance);

        if (before < Number(amount))
            throw new Error("Insufficient wallet balance.");

        const after = before - Number(amount);

        const updated = await tx.wallet.update({
            where: { organizationId },
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
                collegeId,
                departmentId,
                type: "WITHDRAWAL",
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

exports.reserveFunds = async ({
    organizationId,
    collegeId = null,
    departmentId = null,
    amount,
    reference = null,
    description = null
}) => {

    return await prisma.$transaction(async (tx) => {

        const wallet = await tx.wallet.findUnique({
            where: { organizationId }
        });

        if (!wallet)
            throw new Error("Wallet not found.");

        const before = Number(wallet.availableBalance);

        if (before < Number(amount))
            throw new Error("Insufficient wallet balance.");

        const after = before - Number(amount);

        const updated = await tx.wallet.update({
            where: { organizationId },
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
                collegeId,
                departmentId,
                type: "RESERVE",
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

exports.releaseFunds = async ({
    organizationId,
    collegeId = null,
    departmentId = null,
    amount,
    reference = null,
    description = null
}) => {

    return await prisma.$transaction(async (tx) => {

        const wallet = await tx.wallet.findUnique({
            where: { organizationId }
        });

        if (!wallet)
            throw new Error("Wallet not found.");

        const before = Number(wallet.availableBalance);
        const after = before + Number(amount);

        const updated = await tx.wallet.update({
            where: { organizationId },
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
                collegeId,
                departmentId,
                type: "RELEASE",
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

exports.completeWithdrawal = async ({
    organizationId,
    collegeId = null,
    departmentId = null,
    amount,
    reference = null,
    description = null
}) => {

    return await prisma.$transaction(async (tx) => {

        const wallet = await tx.wallet.findUnique({
            where: { organizationId }
        });

        if (!wallet)
            throw new Error("Wallet not found.");

        const before = Number(wallet.availableBalance);
        const after = before;

        const updated = await tx.wallet.update({
            where: { organizationId },
            data: {
                reservedBalance: {
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
                collegeId,
                departmentId,
                type: "WITHDRAWAL",
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