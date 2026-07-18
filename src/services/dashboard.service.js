const prisma = require("../config/prisma");

exports.superDashboard = async () => {

    const [
        organizations,
        users,
        transactions,
        pendingWithdrawals,
        wallets
    ] = await Promise.all([

        prisma.organization.count(),

        prisma.user.count(),

        prisma.transaction.count({

            where: {
                paymentStatus: "SUCCESSFUL"
            }

        }),

        prisma.withdrawal.count({

            where: {
                status: "PENDING"
            }

        }),

        prisma.wallet.findMany()

    ]);

    const totals = wallets.reduce((acc, wallet) => {

        acc.available += wallet.availableBalance;
        acc.pending += wallet.pendingBalance;
        acc.withdrawn += wallet.withdrawnBalance;
        acc.revenue += wallet.totalRevenue;

        return acc;

    }, {

        available: 0,
        pending: 0,
        withdrawn: 0,
        revenue: 0

    });

    return {

        statistics: {

            organizations,

            users,

            successfulTransactions: transactions,

            pendingWithdrawals

        },

        wallets: totals

    };

};