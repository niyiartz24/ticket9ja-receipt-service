const prisma = require("../config/prisma");

exports.processWebhook = async (payload) => {
    console.log("\n==========================================");
    console.log("BUDPAY WEBHOOK RECEIVED");
    console.log("Time:", new Date().toISOString());
    console.log("==========================================");

    console.log(JSON.stringify(payload, null, 2));

    console.log("==========================================\n");

    return true;
};