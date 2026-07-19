const prisma = require("../config/prisma");

exports.getAll = async () => {
    return await prisma.organization.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
};

exports.getById = async (id) => {

    const organization =
        await prisma.organization.findUnique({
            where: { id }
        });

    if (!organization) {
        throw new Error("Organization not found.");
    }

    return organization;
};

exports.create = async (data) => {

    const exists =
        await prisma.organization.findUnique({
            where: {
                shortName: data.shortName
            }
        });

    if (exists) {
        throw new Error("Short name already exists.");
    }

    return await prisma.organization.create({
        data: {
            name: data.name,
            shortName: data.shortName,
            logo: data.logo,
            email: data.email,
            phone: data.phone,
            address: data.address,
            primaryColor: data.primaryColor
        }
    });
};

exports.update = async (id, data) => {

    await exports.getById(id);

    return await prisma.organization.update({

        where: { id },

        data

    });

};

exports.remove = async (id) => {

    await exports.getById(id);

    return await prisma.organization.update({

        where: { id },

        data: {
            isActive: false
        }

    });

};

exports.getPublic = async () => {

    return prisma.organization.findMany({

        where: {

            isActive: true

        },

        select: {

            id: true,

            name: true,

            shortName: true,

            logo: true

        },

        orderBy: {

            name: "asc"

        }

    });

};

exports.getPublicById = async (id) => {

    return prisma.organization.findUnique({

        where: {

            id

        },

        select: {

            id: true,

            name: true,

            shortName: true,

            logo: true

        }

    });

};