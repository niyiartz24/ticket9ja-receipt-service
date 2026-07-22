const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/bankAccount.controller");

    router.use(auth);

router.use(
    permit(
        "SUPER_ADMIN",
        "ORGANIZATION_ADMIN",
        "COLLEGE_ADMIN",
        "DEPARTMENT_ADMIN"
    )
);

router.get("/", controller.getMine);

router.post("/", controller.create);

router.patch("/:id/default", controller.makeDefault);

router.delete("/:id", controller.remove);

module.exports = router;