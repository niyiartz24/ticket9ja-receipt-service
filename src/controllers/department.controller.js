const prisma = require("../config/prisma");

exports.getDepartments = async (req, res) => {

    try {

        const { organizationId } = req.params;

        const departments = await prisma.department.findMany({

            where: {
                organizationId,
                isActive: true
            },

            orderBy: {
                name: "asc"
            }

        });

        return res.json({

            success: true,

            departments

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};