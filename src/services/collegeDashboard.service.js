const prisma = require("../config/prisma");

exports.getDashboard = async (collegeId) => {

    const [
        departments,
        paymentTypes,
        transactions,
        withdrawals,
        wallet
    ] = await Promise.all([

        prisma.department.count({
            where: {
                collegeId
            }
        }),

        prisma.paymentType.count({
            where: {
                collegeId,
                isActive: true
            }
        }),

        prisma.transaction.findMany({
            where: {
                collegeId,
                paymentStatus: "SUCCESSFUL"
            },
            orderBy: {
                paymentDate: "desc"
            }
        }),

        prisma.withdrawal.count({
            where: {
                organization: {
                    colleges: {
                        some: {
                            id: collegeId
                        }
                    }
                },
                status: "PENDING"
            }
        }),

        prisma.college.findUnique({
            where: {
                id: collegeId
            },
            include: {
                organization: {
                    include: {
                        wallet: true
                    }
                }
            }
        })

    ]);

    const revenue = transactions.reduce(
        (sum, t) => sum + Number(t.netAmount),
        0
    );

    return {

        statistics: {

            departments,

            paymentTypes,

            successfulTransactions: transactions.length,

            pendingWithdrawals: withdrawals

        },

        wallet: wallet?.organization?.wallet || null,

        revenue,

        recentTransactions: transactions.slice(0,10)

    };

};