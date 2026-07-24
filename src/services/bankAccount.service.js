const prisma = require("../config/prisma");
const budpay = require("./budpay.service");

function tenantScope(user) {

    switch (user.role) {

        case "ORGANIZATION_ADMIN":
            return {
                organizationId: user.organizationId
            };

        case "COLLEGE_ADMIN":
            return {
                collegeId: user.collegeId
            };

        case "DEPARTMENT_ADMIN":
            return {
                departmentId: user.departmentId
            };

        case "SUPER_ADMIN":
            return {};

        default:
            throw new Error("Unauthorized.");

    }

}

exports.save = async (user, data) => {

    const scope = tenantScope(user);

    if (data.isDefault) {

        await prisma.bankAccount.updateMany({

            where: scope,

            data: {
                isDefault: false
            }

        });

    }

    const existing = await prisma.bankAccount.findFirst({

        where: scope

    });

    if (existing) {

        return prisma.bankAccount.update({

            where: {
                id: existing.id
            },

            data: {

                bankName: data.bankName,

                accountName: data.accountName,

                accountNumber: data.accountNumber,

                bankCode: data.bankCode,

                isDefault: data.isDefault ?? existing.isDefault

            }

        });

    }

    return prisma.bankAccount.create({

        data: {

            ...scope,

            bankName: data.bankName,

            accountName: data.accountName,

            accountNumber: data.accountNumber,

            bankCode: data.bankCode,

            isDefault: data.isDefault ?? true

        }

    });

};

exports.getMine = async (user) => {

    const scope =
        user.role === "SUPER_ADMIN"
            ? {}
            : tenantScope(user);

    return prisma.bankAccount.findMany({

        where: scope,

        orderBy: {

            createdAt: "desc"

        }

    });

};

exports.getAll = async () => {

    return prisma.bankAccount.findMany({

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

exports.makeDefault = async (user, id) => {

    const scope =
        user.role === "SUPER_ADMIN"
            ? {}
            : tenantScope(user);

    const account =
        await prisma.bankAccount.findFirst({

            where: {

                id,

                ...scope

            }

        });

    if (!account) {

        throw new Error("Bank account not found.");

    }

    await prisma.bankAccount.updateMany({

        where: scope,

        data: {

            isDefault: false

        }

    });

    return prisma.bankAccount.update({

        where: {

            id

        },

        data: {

            isDefault: true

        }

    });

};

exports.remove = async (user, id) => {

    const scope =
        user.role === "SUPER_ADMIN"
            ? {}
            : tenantScope(user);

    const account =
        await prisma.bankAccount.findFirst({

            where: {

                id,

                ...scope

            }

        });

    if (!account) {

        throw new Error("Bank account not found.");

    }

    return prisma.bankAccount.delete({

        where: {

            id

        }

    });

};



exports.verify = async ({ bankCode, accountNumber }) => {

    if (!bankCode)
        throw new Error("Bank code is required.");

    if (!accountNumber)
        throw new Error("Account number is required.");

    return await budpay.verifyAccount(
        bankCode,
        accountNumber
    );

};

exports.getBanks = async () => {

    return await budpay.getBanks();

};