const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get(
    "/active",
    async (req, res) => {

        const session =
            await prisma.academicSession.findFirst({

                where: {

                    active: true

                }

            });

        res.json({

            success: true,

            session

        });

    }
);

module.exports = router;