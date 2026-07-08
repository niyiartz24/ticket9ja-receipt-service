const prisma = require("../config/prisma");

exports.getPaymentTypes = async (req, res) => {

    try {

        const { organizationId } = req.params;

        const paymentTypes = await prisma.paymentType.findMany({

            where: {
                organizationId,
                isActive: true
            },

            orderBy: {
                title: "asc"
            }

        });

        return res.json({

            success: true,

            paymentTypes

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};