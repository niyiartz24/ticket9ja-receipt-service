const prisma = require("../config/prisma");

exports.overview = async (organizationId) => {

    const [

        wallet,

        transactions,

        pendingWithdrawals,

        paymentTypes,

        departments,

        colleges

    ] = await Promise.all([

        prisma.wallet.findUnique({

            where: {
                organizationId
            }

        }),

        prisma.transaction.count({

            where: {

                organizationId,

                paymentStatus: "SUCCESSFUL"

            }

        }),

        prisma.withdrawal.count({

            where: {

                organizationId,

                status: "PENDING"

            }

        }),

        prisma.paymentType.count({

            where: {

                organizationId,

                isActive: true

            }

        }),

        prisma.department.count({

            where: {

                organizationId,

                isActive: true

            }

        }),

        prisma.college.count({

            where: {

                organizationId,

                active: true

            }

        })

    ]);

    return {

        wallet,

        statistics: {

            transactions,

            pendingWithdrawals,

            paymentTypes,

            departments,

            colleges

        }

    };

};

exports.recentTransactions = async (organizationId) => {

    return prisma.transaction.findMany({

        where: {

            organizationId

        },

        orderBy: {

            createdAt: "desc"

        },

        take: 10,

        include: {

            paymentType: true,

            department: true,

            college: true

        }

    });

};

exports.monthlyRevenue = async (organizationId) => {

    const start = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const txs =
        await prisma.transaction.findMany({

            where: {

                organizationId,

                paymentStatus: "SUCCESSFUL",

                paymentDate: {

                    gte: start

                }

            }

        });

    return txs.reduce(

        (sum, tx) => sum + Number(tx.netAmount),

        0

    );

};

exports.wallet = async (organizationId) => {

    return prisma.wallet.findUnique({

        where: {

            organizationId

        }

    });

};