const prisma = require("../config/prisma");

exports.create = async (data) => {

    return prisma.notification.create({

        data: {

            title: data.title,

            message: data.message,

            type: data.type || "INFO",

            userId: data.userId || null,

            organizationId:
                data.organizationId || null,

            collegeId:
                data.collegeId || null,

            departmentId:
                data.departmentId || null

        }

    });

};

exports.list = async (user, pageSize = 5) => {

    const conditions = [];

    switch (user.role) {

        case "SUPER_ADMIN":
            break;

        case "ORGANIZATION_ADMIN":
            conditions.push({
                organizationId: user.organizationId
            });
            break;

        case "COLLEGE_ADMIN":
            conditions.push({
                collegeId: user.collegeId
            });
            break;

        case "DEPARTMENT_ADMIN":
            conditions.push({
                departmentId: user.departmentId
            });
            break;

    }

    if (user.id) {

        conditions.push({
            userId: user.id
        });

    }

    const where =
        conditions.length > 0
            ? { OR: conditions }
            : {};

    return prisma.notification.findMany({

        where,

        take: Number(pageSize),

        orderBy: {

            createdAt: "desc"

        }

    });

};

exports.markRead = async (id) => {

    return prisma.notification.update({

        where: {

            id

        },

        data: {

            read: true

        }

    });

};