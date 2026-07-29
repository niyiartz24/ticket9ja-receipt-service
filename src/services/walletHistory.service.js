const prisma = require("../config/prisma");

exports.list = async (user) => {

    let where = {};

    switch (user.role) {

        case "SUPER_ADMIN":
            break;

        case "ORGANIZATION_ADMIN":
            where.organizationId = user.organizationId;
            where.collegeId = null;
            where.departmentId = null;
            break;

        case "COLLEGE_ADMIN":
            where.collegeId = user.collegeId;
            where.departmentId = null;
            break;

        case "DEPARTMENT_ADMIN":
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