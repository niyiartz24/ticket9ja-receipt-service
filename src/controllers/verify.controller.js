const prisma = require("../config/prisma");
const receiptTemplate = require("../templates/verify.template");

exports.verifyReceipt = async (req, res) => {

    try {

        const receipt = await prisma.transaction.findUnique({

            where: {

                receiptId: req.params.receiptId

            }

        });

        if (!receipt) {

            return res.status(404).send(`
                <h1>Receipt Not Found</h1>
            `);

        }

        res.send(receiptTemplate(receipt));

    }

    catch (error) {

        res.status(500).send(error.message);

    }

};