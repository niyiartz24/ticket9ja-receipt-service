const prisma = require("../config/prisma");

function buildScope(user) {
    switch (user.role) {

        case "SUPER_ADMIN":
            return {};

        case "ORGANIZATION_ADMIN":
            return {
                organizationId: user.organizationId
            };

        case "COLLEGE_ADMIN":
            return {
                collegeId: user.collegeId
            };

        case "DEPARTMENT_ADMIN":
            return {
                departmentId: user.departmentId
            };

        default:
            return {};
    }
}

exports.getSummary = async (user) => {

    const scope = buildScope(user);

    const [
        organizations,
        colleges,
        departments,
        users,
        transactions,
        withdrawals,
        wallet
    ] = await Promise.all([

        user.role === "SUPER_ADMIN"
            ? prisma.organization.count()
            : Promise.resolve(1),

        user.role === "SUPER_ADMIN"
            ? prisma.college.count()
            : prisma.college.count({
                where: scope.organizationId
                    ? { organizationId: scope.organizationId }
                    : scope.collegeId
                        ? { id: scope.collegeId }
                        : {}
            }),

        user.role === "SUPER_ADMIN"
            ? prisma.department.count()
            : prisma.department.count({
                where: scope.departmentId
                    ? { id: scope.departmentId }
                    : scope.collegeId
                        ? { collegeId: scope.collegeId }
                        : scope.organizationId
                            ? { organizationId: scope.organizationId }
                            : {}
            }),

        prisma.user.count({
            where: scope
        }),

        prisma.transaction.findMany({
            where: {
                ...scope,
                paymentStatus: "SUCCESSFUL"
            }
        }),

        prisma.withdrawal.count({
            where: scope
        }),

        user.role === "SUPER_ADMIN"
            ? Promise.resolve(null)
            : prisma.wallet.findUnique({
                where: {
                    organizationId: user.organizationId
                }
            })

    ]);

    const totalRevenue = transactions.reduce(
        (sum, t) => sum + Number(t.netAmount),
        0
    );

    return {

        organizations,

        colleges,

        departments,

        users,

        withdrawals,

        transactions: transactions.length,

        totalRevenue,

        walletBalance: wallet
            ? Number(wallet.availableBalance)
            : 0

    };

};

exports.getRevenueSeries = async (user) => {

    const scope = buildScope(user);

    const txns = await prisma.transaction.findMany({

        where: {

            ...scope,

            paymentStatus: "SUCCESSFUL"

        },

        orderBy: {

            createdAt: "asc"

        }

    });

    const months = {};

    txns.forEach(tx => {

        const month = tx.createdAt.toLocaleString("en-US", {

            month: "short"

        });

        months[month] =
            (months[month] || 0) +
            Number(tx.netAmount);

    });

    return Object.entries(months).map(

        ([month, amount]) => ({

            month,

            amount

        })

    );

};