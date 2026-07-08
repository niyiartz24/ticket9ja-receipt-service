const express = require("express");
const router = express.Router();

const paymentTypeController = require("../controllers/paymentType.controller");

router.get("/:organizationId", paymentTypeController.getPaymentTypes);

module.exports = router;