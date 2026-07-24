const prisma = require("../config/prisma");

function tenantFilter(user) {
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

        default:
            throw new Error("Invalid role.");
    }
}

exports.getWallet = async (user) => {

    if (user.role === "SUPER_ADMIN") {
        throw new Error("Super Admin has no wallet.");
    }

    const where = tenantFilter(user);

    const wallet = await prisma.wallet.findFirst({
        where
    });

    if (!wallet)
        throw new Error("Wallet not found.");

    return wallet;
};

exports.updateBalances = async (
    walletId,
    data
) => {

    return prisma.wallet.update({

        where: {
            id: walletId
        },

        data

    });

};