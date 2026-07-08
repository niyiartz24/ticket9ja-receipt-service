const express = require("express");

const router = express.Router();

const verifyController = require("../controllers/verify.controller");

router.get("/:receiptId", verifyController.verifyReceipt);

module.exports = router;