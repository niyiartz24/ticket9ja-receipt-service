const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

router.post("/initiate", paymentController.initiate);

router.get(
    "/verify/:reference",
    paymentController.verify
);

module.exports = router;