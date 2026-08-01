const express = require("express");

const router = express.Router();

const auditLogController =
    require("../controllers/auditLog.controller");

router.get(
    "/",
    auditLogController.list
);

module.exports = router;