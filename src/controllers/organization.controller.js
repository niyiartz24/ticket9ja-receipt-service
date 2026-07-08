const prisma = require("../config/prisma");

exports.getOrganizations = async (req, res) => {
    try {

        const organizations = await prisma.organization.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                name: "asc"
            }
        });

        res.json({
            success: true,
            organizations
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};