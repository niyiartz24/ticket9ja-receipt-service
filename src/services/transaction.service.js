const prisma = require("../config/prisma");

exports.getAll = async (user, query) => {

    const page =
        Number(query.page || 1);

    const pageSize =
        Number(query.pageSize || 10);

    const skip =
        (page - 1) * pageSize;

    const where = {};

    switch (user.role) {

        case "ORGANIZATION_ADMIN":

    if (!user.organizationId)
        throw new Error("Organization not assigned.");

    where.organizationId = user.organizationId;
    break;

case "COLLEGE_ADMIN":

    if (!user.collegeId)
        throw new Error("College not assigned.");

    where.collegeId = user.collegeId;
    break;

case "DEPARTMENT_ADMIN":

    if (!user.departmentId)
        throw new Error("Department not assigned.");

    where.departmentId = user.departmentId;
    break;

    }

    if (query.status) {
        where.paymentStatus = query.status;
    }

    if (query.search) {

        where.OR = [

            {
                payerName: {
                    contains: query.search,
                    mode: "insensitive"
                }
            },

            {
                reference: {
                    contains: query.search,
                    mode: "insensitive"
                }
            },

            {
                receiptId: {
                    contains: query.search,
                    mode: "insensitive"
                }
            }

        ];

    }

    const [transactions, total] =
        await Promise.all([

            prisma.transaction.findMany({

                where,

                skip,

                take: pageSize,

                orderBy: {
                    createdAt: "desc"
                },

                include: {
                    paymentType: true
                }

            }),

            prisma.transaction.count({
                where
            })

        ]);

    return {
    data: transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
};

};

exports.getOne = async (user, id) => {

    const transaction =
        await prisma.transaction.findUnique({

            where: {
                id
            },

            include: {

                paymentType: true,
                organization: true,
                college: true,
                department: true

            }

        });

    if (!transaction) {
        throw new Error("Transaction not found.");
    }

    switch (user.role) {

        case "ORGANIZATION_ADMIN":

            if (transaction.organizationId !== user.organizationId)
                throw new Error("Access denied.");

            break;

        case "COLLEGE_ADMIN":

            if (transaction.collegeId !== user.collegeId)
                throw new Error("Access denied.");

            break;

        case "DEPARTMENT_ADMIN":

            if (transaction.departmentId !== user.departmentId)
                throw new Error("Access denied.");

            break;

    }

    return transaction;

};