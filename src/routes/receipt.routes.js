const express = require("express");

const router = express.Router();

const receiptController = require("../controllers/receipt.controller");

router.post("/search", receiptController.searchReceipt);

router.get("/:receiptId/view", receiptController.viewReceipt);

router.get("/:receiptId", receiptController.getReceipt);

router.get("/:receiptId/pdf", receiptController.downloadPDF);

router.post("/:receiptId/email", receiptController.emailReceipt);

module.exports = router;