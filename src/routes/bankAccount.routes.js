const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/bankAccount.controller");

router.post("/", controller.create);

router.get(
    "/:organizationId",
    controller.getByOrganization
);

router.patch(
    "/:id/default",
    controller.makeDefault
);

router.delete(
    "/:id",
    controller.remove
);

module.exports = router;