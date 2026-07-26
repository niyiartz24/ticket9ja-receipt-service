const prisma = require("../config/prisma");

exports.list = async (user) => {

    const where = {};

    switch (user.role) {

        case "SUPER_ADMIN":
            break;

        case "ORGANIZATION_ADMIN":
            where.organizationId = user.organizationId;
            break;

        case "COLLEGE_ADMIN":
            where.organizationId = user.organizationId;
            where.collegeId = user.collegeId;
            break;

        case "DEPARTMENT_ADMIN":
        case "FINANCE_OFFICER":
            where.organizationId = user.organizationId;
            where.departmentId = user.departmentId;
            break;

        default:
            throw new Error("Access denied.");

    }

    return prisma.walletHistory.findMany({

        where,

        orderBy: {
            createdAt: "desc"
        },

        take: 100

    });

};