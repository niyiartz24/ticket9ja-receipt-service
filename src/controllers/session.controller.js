const prisma = require("../config/prisma");

exports.getActiveSession = async (req, res) => {

    try {

        const session = await prisma.academicSession.findFirst({

            where: {
                active: true
            }

        });

        return res.json({

            success: true,

            session

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};