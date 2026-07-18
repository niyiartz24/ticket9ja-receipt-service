const prisma = require("../config/prisma");

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

    if (data.isDefault) {

        await prisma.bankAccount.updateMany({

            where: {
                organizationId: data.organizationId
            },

            data: {
                isDefault: false
            }

        });

    }

    return await prisma.bankAccount.create({

        data: {

            organizationId: data.organizationId,

            bankName: data.bankName,

            accountName: data.accountName,

            accountNumber: data.accountNumber,

            isDefault: data.isDefault || false

        }

    });

};

exports.getByOrganization = async (organizationId) => {

    return await prisma.bankAccount.findMany({

        where: {
            organizationId
        },

        orderBy: {
            isDefault: "desc"
        }

    });

};

exports.makeDefault = async (id) => {

    const account =
        await prisma.bankAccount.findUnique({
            where: {
                id
            }
        });

    if (!account) {
        throw new Error("Bank account not found.");
    }

    await prisma.bankAccount.updateMany({

        where: {
            organizationId: account.organizationId
        },

        data: {
            isDefault: false
        }

    });

    return await prisma.bankAccount.update({

        where: {
            id
        },

        data: {
            isDefault: true
        }

    });

};

exports.remove = async (id) => {

    return await prisma.bankAccount.delete({

        where: {
            id
        }

    });

};