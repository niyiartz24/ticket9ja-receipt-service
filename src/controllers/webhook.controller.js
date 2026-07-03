const budpayService = require("../services/budpay.service");

exports.handleWebhook = async (req, res) => {
    console.log("\n========== WEBHOOK ==========");
    console.log("Method:", req.method);
    console.log("Headers:");
    console.log(req.headers);

    console.log("\nBody:");
    console.dir(req.body, { depth: null });

    console.log("\nRaw:");
    console.log(JSON.stringify(req.body, null, 2));

    console.log("=============================\n");

    return res.status(200).json({
        success: true
    });
};