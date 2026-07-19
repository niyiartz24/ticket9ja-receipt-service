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
            where.organizationId = user.organizationId;
            break;

        case "COLLEGE_ADMIN":
            where.collegeId = user.collegeId;
            break;

        case "DEPARTMENT_ADMIN":
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

        transactions,

        pagination: {

            page,

            pageSize,

            total,

            totalPages:
                Math.ceil(total / pageSize)

        }

    };

};

exports.getOne = async (user, id) => {

    const where = {
        id
    };

    const transaction =
        await prisma.transaction.findUnique({

            where,

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

    if (
        user.role === "ORGANIZATION_ADMIN" &&
        transaction.organizationId !== user.organizationId
    ) {
        throw new Error("Access denied.");
    }

    if (
        user.role === "COLLEGE_ADMIN" &&
        transaction.collegeId !== user.collegeId
    ) {
        throw new Error("Access denied.");
    }

    if (
        user.role === "DEPARTMENT_ADMIN" &&
        transaction.departmentId !== user.departmentId
    ) {
        throw new Error("Access denied.");
    }

    return transaction;

};