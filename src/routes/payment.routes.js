const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

router.post("/initiate", paymentController.initiate);

app.get("/payment-success", (req, res) => {
    res.send("Payment completed successfully. You can close this page.");
});

module.exports = router;