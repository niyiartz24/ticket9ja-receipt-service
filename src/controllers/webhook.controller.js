const paymentService = require("../services/payment.service");

exports.handleWebhook = async (req, res) => {

    try {

        console.log("BudPay Webhook Received");
        console.log(JSON.stringify(req.body, null, 2));

        const reference =
            req.body.data.reference;

        const verification =
            await paymentService.verifyPayment(reference);

        if (
            verification.status &&
            verification.data.status === "success"
        ) {

            await paymentService.completePayment(
                reference,
                verification
            );

        }

        return res.sendStatus(200);

    } catch (err) {

        console.error(err);

        return res.sendStatus(500);

    }

};