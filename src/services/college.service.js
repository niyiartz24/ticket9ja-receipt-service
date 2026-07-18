const prisma = require("../config/prisma");

exports.getAll = async () => {

    return await prisma.college.findMany({

        include: {
            organization: true
        },

        orderBy: {
            createdAt: "desc"
        }

    });

};

exports.getById = async (id) => {

    const college = await prisma.college.findUnique({

        where: { id },

        include: {
            organization: true
        }

    });

    if (!college) {
        throw new Error("College not found.");
    }

    return college;

};

exports.getByOrganization = async (organizationId) => {

    return await prisma.college.findMany({

        where: {
            organizationId,
            active: true
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

    const exists =
        await prisma.college.findFirst({

            where: {

                organizationId: data.organizationId,

                name: data.name

            }

        });

    if (exists) {
        throw new Error(
            "College already exists in this organization."
        );
    }

    return await prisma.college.create({

        data: {

            organizationId: data.organizationId,

            name: data.name,

            shortName: data.shortName,

            email: data.email,

            phone: data.phone,

            logo: data.logo

        }

    });

};

exports.update = async (id, data) => {

    await exports.getById(id);

    return await prisma.college.update({

        where: { id },

        data

    });

};

exports.remove = async (id) => {

    await exports.getById(id);

    return await prisma.college.update({

        where: { id },

        data: {
            active: false
        }

    });

};