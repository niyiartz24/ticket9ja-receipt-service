const prisma = require("../config/prisma");

exports.getAll = async () => {

    return await prisma.department.findMany({

        include: {

            organization: true,

            college: true

        },

        orderBy: {

            name: "asc"

        }

    });

};

exports.getById = async (id) => {

    const department =
        await prisma.department.findUnique({

            where: { id },

            include: {

                organization: true,

                college: true

            }

        });

    if (!department) {

        throw new Error("Department not found.");

    }

    return department;

};

exports.getByCollege = async (collegeId) => {

    return await prisma.department.findMany({

        where: {

            collegeId,

            isActive: true

        },

        orderBy: {

            name: "asc"

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

        throw new Error("Organization not found.");

    }

    const college =
        await prisma.college.findUnique({

            where: {

                id: data.collegeId

            }

        });

    if (!college) {

        throw new Error("College not found.");

    }

    if (college.organizationId !== data.organizationId) {

        throw new Error(
            "College does not belong to this organization."
        );

    }

    const exists =
        await prisma.department.findFirst({

            where: {

                collegeId: data.collegeId,

                name: data.name

            }

        });

    if (exists) {

        throw new Error(
            "Department already exists."
        );

    }

    return await prisma.department.create({

        data: {

            name: data.name,

            organizationId: data.organizationId,

            collegeId: data.collegeId

        }

    });

};

exports.update = async (id, data) => {

    await exports.getById(id);

    return await prisma.department.update({

        where: { id },

        data

    });

};

exports.remove = async (id) => {

    await exports.getById(id);

    return await prisma.department.update({

        where: { id },

        data: {

            isActive: false

        }

    });

};