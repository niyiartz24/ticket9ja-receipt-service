const prisma = require("../config/prisma");

exports.processWebhook = async (req) => {

    console.log("===============");
    console.log("BudPay Webhook");
    console.log("===============");

    console.log(req.headers);

    console.log(req.body);

    return true;

};