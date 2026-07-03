const prisma = require("../config/prisma");

exports.processWebhook = async (payload) => {

    console.log("================================");
    console.log("Incoming BudPay Webhook");
    console.log("================================");

    console.log(JSON.stringify(payload, null, 2));

    // We'll save to the database after we know
    // BudPay's exact payload structure.

    return true;
};