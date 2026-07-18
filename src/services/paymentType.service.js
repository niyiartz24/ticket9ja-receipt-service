const prisma = require("../config/prisma");

exports.getAll = async () => {

    return await prisma.paymentType.findMany({

        include: {

            organization: true,

            college: true,

            department: true

        },

        orderBy: {

            createdAt: "desc"

        }

    });

};

exports.getById = async (id) => {

    const paymentType =
        await prisma.paymentType.findUnique({

            where: { id },

            include: {

                organization: true,

                college: true,

                department: true

            }

        });

    if (!paymentType) {

        throw new Error(
            "Payment type not found."
        );

    }

    return paymentType;

};

exports.getByOrganization = async (organizationId) => {

    return await prisma.paymentType.findMany({

        where: {

            organizationId,

            collegeId: null,

            departmentId: null,

            isActive: true

        },

        orderBy: {

            title: "asc"

        }

    });

};

exports.getByCollege = async (collegeId) => {

    return await prisma.paymentType.findMany({

        where: {

            collegeId,

            departmentId: null,

            isActive: true

        },

        orderBy: {

            title: "asc"

        }

    });

};

exports.getByDepartment = async (departmentId) => {

    return await prisma.paymentType.findMany({

        where: {

            departmentId,

            isActive: true

        },

        orderBy: {

            title: "asc"

        }

    });

};

exports.create = async (data) => {

    const organization =
        await prisma.organization.findUnique({

            where: {
                id: data.organizationId
            }

        });

    if (!organization) {

        throw new Error(
            "Organization not found."
        );

    }

    if (data.collegeId) {

        const college =
            await prisma.college.findUnique({

                where: {
                    id: data.collegeId
                }

            });

        if (!college) {

            throw new Error(
                "College not found."
            );

        }

        if (
            college.organizationId !==
            data.organizationId
        ) {

            throw new Error(
                "College does not belong to the organization."
            );

        }

    }

    if (data.departmentId) {

        const department =
            await prisma.department.findUnique({

                where: {
                    id: data.departmentId
                }

            });

        if (!department) {

            throw new Error(
                "Department not found."
            );

        }

    }

    const exists =
        await prisma.paymentType.findFirst({

            where: {

                title: data.title,

                organizationId:
                    data.organizationId,

                collegeId:
                    data.collegeId || null,

                departmentId:
                    data.departmentId || null

            }

        });

    if (exists) {

        throw new Error(
            "Payment type already exists."
        );

    }

    return await prisma.paymentType.create({

        data: {

            title: data.title,

            description:
                data.description,

            defaultAmount:
                Number(data.defaultAmount),

            organizationId:
                data.organizationId,

            collegeId:
                data.collegeId || null,

            departmentId:
                data.departmentId || null,

            allowCustomAmount:
                data.allowCustomAmount || false,

            minimumAmount:
                data.minimumAmount || null,

            maximumAmount:
                data.maximumAmount || null,

            dueDate:
                data.dueDate
                    ? new Date(data.dueDate)
                    : null,

            createdBy:
                data.createdBy || null

        }

    });

};

exports.update = async (id, data) => {

    await exports.getById(id);

    return await prisma.paymentType.update({

        where: { id },

        data

    });

};

exports.remove = async (id) => {

    await exports.getById(id);

    return await prisma.paymentType.update({

        where: { id },

        data: {

            isActive: false

        }

    });

};

const feeService =
    require("./fee.service");

exports.calculate =
async (id) => {

    const payment =
        await exports.getById(id);

    const pricing =
        await feeService.calculate(
            payment.defaultAmount
        );

    return {

        ...payment,

        ...pricing

    };

};