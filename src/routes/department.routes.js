const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/department.controller");

router.get("/:organizationId", departmentController.getDepartments);

module.exports = router;