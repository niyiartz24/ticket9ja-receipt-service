const prisma = require("../config/prisma");
const notificationService = require("./notification.service");

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

    const organization = await prisma.organization.create({

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

await notificationService.create({

    type: "SUCCESS",

    title: "Organization Created",

    message: `${organization.name} has been created.`,

    organizationId: organization.id

});

return organization;
};

exports.update = async (id, data) => {

    await exports.getById(id);

    return await prisma.organization.update({

        where: { id },

        data

    });

};

exports.suspend = async (id) => {

    const organization = await exports.getById(id);

    return prisma.organization.update({

        where: {
            id
        },

        data: {
            isActive: !organization.isActive
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